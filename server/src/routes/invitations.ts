import { Hono, type Context } from "hono";
import type { Bindings } from "../types";
import { hashPassword, hashToken, signJwt, verifyPassword } from "../lib/auth";
import { tryGetAuthUser, type AuthVariables } from "../middleware/auth";

const invitations = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

const CAREGIVER_ROLE = "caregiver";

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
    const approvedRole = CAREGIVER_ROLE;
    await c.env.baby_tracker_db
      .prepare(
        "INSERT INTO baby_members (id, baby_id, user_id, role, created_at) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(crypto.randomUUID(), invite.baby_id, userId, approvedRole, now)
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
  const { code, name, password } = body;
  const role = CAREGIVER_ROLE;

  if (!code || !name || !password) {
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
    const valid = await verifyPassword(password, existingUser.password_hash);
    if (!valid) {
      return c.json({ success: false, message: "อีเมลนี้มีผู้ใช้งานแล้ว และรหัสผ่านไม่ถูกต้อง กรุณาเข้าสู่ระบบก่อน" }, 401);
    }
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

  // 4. Create Join Request if not already a member
  const existingMember = await c.env.baby_tracker_db
    .prepare("SELECT id FROM baby_members WHERE baby_id = ? AND user_id = ?")
    .bind(baby.id, userId)
    .first();

  if (!existingMember) {
    // Check if there is already a pending request
    const pendingRequest = await c.env.baby_tracker_db
      .prepare(
        "SELECT id FROM invitations WHERE baby_id = ? AND email = ? AND status IN ('pending', 'requested')"
      )
      .bind(baby.id, email)
      .first();

    if (!pendingRequest) {
      // Create a requested invitation
      await c.env.baby_tracker_db
        .prepare(
          "INSERT INTO invitations (id, baby_id, email, role, token_hash, expires_at, status, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(
          crypto.randomUUID(),
          baby.id,
          email,
          role,
          `request_${crypto.randomUUID()}`,
          now + 30 * 24 * 60 * 60, // 30 days expiry for requests
          "requested",
          userId, // They requested it themselves
          now
        )
        .run();
    }
  }

  // 5. Generate Token for the user (Auto-login)
  const jwtSecret = c.env.JWT_SECRET;
  if (!jwtSecret) {
    return c.json({ success: false, message: "Server error" }, 500);
  }
  const token = await signJwt({ sub: userId, email, name }, jwtSecret);

  return c.json({
    success: true,
    message: existingMember ? "You are already a member" : "Request sent successfully",
    data: {
      token,
      userId,
      babyId: existingMember ? baby.id : null, // If not a member, they don't have access yet
      status: existingMember ? "active" : "requested",
    },
  });
});

export default invitations;
