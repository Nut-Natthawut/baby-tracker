import { Hono, type Context } from "hono";
import type { Bindings } from "../types";
import { hashPassword, hashToken, signJwt } from "../lib/auth";
import { tryGetAuthUser, type AuthVariables } from "../middleware/auth";

const invitations = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

type ResolveUserResult =
  | { userId: string; issuedToken: string | null }
  | { response: Response };

async function resolveUserFromInvite(
  c: Context<{ Bindings: Bindings; Variables: AuthVariables }>,
  inviteEmail: string,
  now: number,
  jwtSecret: string
): Promise<ResolveUserResult> {
  const authUser = await tryGetAuthUser(c);

  if (authUser) {
    if (normalizeEmail(authUser.email) !== inviteEmail) {
      return { response: c.json({ success: false, message: "Invite email mismatch" }, 403) };
    }
    return { userId: authUser.sub, issuedToken: null };
  }

  const body = await c.req.json().catch(() => ({}));
  const password = String((body as any)?.password ?? "");
  const name = (body as any)?.name ? String((body as any).name).trim() : null;

  if (!password) {
    return { response: c.json({ success: false, message: "Password is required" }, 400) };
  }

  const existing: any = await c.env.baby_tracker_db
    .prepare("SELECT id FROM users WHERE email = ?")
    .bind(inviteEmail)
    .first();

  if (existing) {
    return {
      response: c.json({ success: false, message: "Login required", error: "LOGIN_REQUIRED" }, 409),
    };
  }

  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await c.env.baby_tracker_db
    .prepare(
      "INSERT INTO users (id, email, password_hash, name, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(userId, inviteEmail, passwordHash, name, now, now)
    .run();

  const issuedToken = await signJwt({ sub: userId, email: inviteEmail, name }, jwtSecret);
  return { userId, issuedToken };
}

invitations.post("/:token/accept", async (c) => {
  const token = String(c.req.param("token") ?? "");
  if (!token) {
    return c.json({ success: false, message: "Token is required" }, 400);
  }

  const jwtSecret = c.env.JWT_SECRET;
  if (!jwtSecret) {
    return c.json({ success: false, message: "Server misconfigured" }, 500);
  }

  const tokenHash = await hashToken(token);
  const invite: any = await c.env.baby_tracker_db
    .prepare("SELECT * FROM invitations WHERE token_hash = ?")
    .bind(tokenHash)
    .first();

  if (!invite) {
    return c.json({ success: false, message: "Invite not found" }, 404);
  }

  const now = nowSeconds();
  if (invite.status !== "pending") {
    return c.json({ success: false, message: "Invite is not active" }, 400);
  }

  if (Number(invite.expires_at) <= now) {
    await c.env.baby_tracker_db
      .prepare("UPDATE invitations SET status = 'expired' WHERE id = ?")
      .bind(invite.id)
      .run();
    return c.json({ success: false, message: "Invite has expired" }, 400);
  }

  const inviteEmail = normalizeEmail(invite.email);
  const resolved = await resolveUserFromInvite(c, inviteEmail, now, jwtSecret);
  if ("response" in resolved) {
    return resolved.response;
  }
  const { userId, issuedToken } = resolved;

  const existingMember = await c.env.baby_tracker_db
    .prepare("SELECT id FROM baby_members WHERE baby_id = ? AND user_id = ?")
    .bind(invite.baby_id, userId)
    .first();

  if (!existingMember) {
    await c.env.baby_tracker_db
      .prepare(
        "INSERT INTO baby_members (id, baby_id, user_id, role, created_at) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(crypto.randomUUID(), invite.baby_id, userId, invite.role, now)
      .run();
  }

  await c.env.baby_tracker_db
    .prepare("UPDATE invitations SET status = 'accepted', accepted_at = ? WHERE id = ?")
    .bind(now, invite.id)
    .run();

  return c.json({
    success: true,
    data: {
      token: issuedToken,
      userId,
    },
  });
});

// Join via Room Code (Public)
invitations.post("/join", async (c) => {
  const body = await c.req.json();
  const { code, role, name, password } = body;

  if (!code || !role || !name || !password) {
    return c.json({ success: false, message: "Missing required fields" }, 400);
  }

  const now = nowSeconds();

  // 1. Validate Code
  const baby: any = await c.env.baby_tracker_db
    .prepare("SELECT id FROM babies WHERE invite_code = ? AND invite_expires_at > ?")
    .bind(code, now)
    .first();

  if (!baby) {
    return c.json({ success: false, message: "Invalid or expired code" }, 404);
  }

  // 2. Check if user exists (by email/name? No email provided in requirement for Room Code flow, 
  // but to create a user we usually need an email or unique ID. 
  // The prompt says "Input: { code, role, name, password }". 
  // It does NOT mention Email.
  // HOWEVER, existing `users` table requires `email`.
  // If we don't have email, we can't create a standard user easily unless we generate a fake one or require email.
  // Let's assume the UI asks for Email too, OR we generate one?
  // Use Case: "Guest travels to the site -> Enters Code -> Selects Role -> Joins"
  // If they don't provide email, how do they log in again?
  // Maybe they just use Name + Password? (Not supported by current auth which uses Email).
  // I will add `email` to the input requirements to be safe and consistent.

  const email = body.email ? normalizeEmail(body.email) : null;
  if (!email) {
    return c.json({ success: false, message: "Email is required for account creation" }, 400);
  }

  // 3. Create or Get User
  // Check if user exists
  const existingUser: any = await c.env.baby_tracker_db
    .prepare("SELECT id, password_hash, name FROM users WHERE email = ?")
    .bind(email)
    .first();

  let userId = "";

  if (existingUser) {
    userId = existingUser.id;
    // Verify password if they are joining (Login check)
    // Note: If they are already logged in on client, they might send a token header?
    // But this constitutes a "Login & Join" action.
    // Let's verify password if provided.
    // NOTE: This might be insecure if we don't handle rate limits, but for this assignment it's likely fine.
    // If they are just "joining", maybe we don't force login if they are arguably "authenticated" by the room code?
    // No, that's bad security. They need to prove they own the account.

    // For simplicity: If user exists, we REQUIRE password match to "Join" as that user.
    // Or we fail and say "User exists, please login first".
    // Let's try to verify password.

    /* 
       Wait, if the user is already logged in, the CLIENT should just call `POST /invitations/join` (authenticated) 
       or we handle it here by checking `c.get('user')`?
       `invitations` router doesn't use `requireAuth` globally.
       Let's check if we can get the user from context if middleware was applied? 
       It seems `invitations.ts` does NOT have `use('*', requireAuth)`.
    */

    // Let's stick to the prompt flow: Code -> Role -> Name -> Password.
    // Implies creating a new user or logging in.

    // If user exists:
    // We could return error: "Email already registered. Please login to join."
    // OR we verify password and proceed.
    // Let's verify password.
    // const valid = await verifyPassword(password, existingUser.passwordHash); // Implementation needed
    // But we don't have `verifyPassword` imported here easily (only `hashPassword`).
    // Actually `hashPassword` usually implies we can compare? No, bcrypt need `compare`.
    // We only have `hashToken` and `signJwt`. We need to check `lib/auth` for password verification.

    return c.json({ success: false, message: "Email already in use. Please login first." }, 409);
  } else {
    // Create new user
    userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    await c.env.baby_tracker_db
      .prepare(
        "INSERT INTO users (id, email, password_hash, name, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .bind(userId, email, passwordHash, name, now, now)
      .run();
  }

  // 4. Add to Baby Members
  const existingMember = await c.env.baby_tracker_db
    .prepare("SELECT id FROM baby_members WHERE baby_id = ? AND user_id = ?")
    .bind(baby.id, userId)
    .first();

  if (!existingMember) {
    await c.env.baby_tracker_db
      .prepare(
        "INSERT INTO baby_members (id, baby_id, user_id, role, created_at) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(crypto.randomUUID(), baby.id, userId, role, now)
      .run();
  }

  // 5. Generate Token for the user (Auto-login)
  const jwtSecret = c.env.JWT_SECRET;
  if (!jwtSecret) {
    return c.json({ success: false, message: "Server error" }, 500);
  }
  const token = await signJwt({ sub: userId, email, name }, jwtSecret);

  return c.json({
    success: true,
    data: {
      token,
      userId,
      babyId: baby.id
    },
  });
});

export default invitations;
