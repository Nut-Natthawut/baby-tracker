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

export default invitations;
