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

// Join via Room Code
invitations.post("/join", async (c) => {
  const body = await c.req.json();
  const { code } = body;
  const role = body.role === "parent" ? "parent" : CAREGIVER_ROLE;

  if (!code) {
    return c.json({ success: false, message: "Room code is required" }, 400);
  }

  const now = nowSeconds();

  // 1. Validate Code
  const baby: any = await c.env.baby_tracker_db
    .prepare("SELECT id FROM babies WHERE invite_code = ? AND invite_expires_at > ?")
    .bind(code, now)
    .first();

  if (!baby) {
    return c.json({ success: false, message: "รหัสไม่ถูกต้องหรือหมดอายุ" }, 404);
  }

  // 2. Resolve user — prefer authenticated user, fallback to body credentials
  const authUser = await tryGetAuthUser(c);
  let userId = "";
  let email = "";
  let name: string | null = null;
  let issuedToken: string | null = null;

  if (authUser) {
    // Authenticated user — use their identity directly
    userId = authUser.sub;
    email = authUser.email;
    name = authUser.name ?? null;
  } else {
    // Fallback: require email/name/password for unauthenticated users
    const bodyEmail = body.email ? normalizeEmail(body.email) : null;
    const bodyName = body.name ? String(body.name).trim() : null;
    const bodyPassword = body.password ? String(body.password) : null;

    if (!bodyEmail || !bodyName || !bodyPassword) {
      return c.json({ success: false, message: "กรุณาเข้าสู่ระบบก่อน" }, 401);
    }

    email = bodyEmail;
    name = bodyName;

    const existingUser: any = await c.env.baby_tracker_db
      .prepare("SELECT id, password_hash, name FROM users WHERE email = ?")
      .bind(email)
      .first();

    if (existingUser) {
      userId = existingUser.id;
      const valid = await verifyPassword(bodyPassword, existingUser.password_hash);
      if (!valid) {
        return c.json({ success: false, message: "อีเมลนี้มีผู้ใช้งานแล้ว กรุณาเข้าสู่ระบบก่อน" }, 401);
      }
    } else {
      userId = crypto.randomUUID();
      const passwordHash = await hashPassword(bodyPassword);
      await c.env.baby_tracker_db
        .prepare(
          "INSERT INTO users (id, email, password_hash, name, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?)"
        )
        .bind(userId, email, passwordHash, name, now, now)
        .run();
    }

    // Issue token for newly authenticated user
    const jwtSecret = c.env.JWT_SECRET;
    if (!jwtSecret) {
      return c.json({ success: false, message: "Server error" }, 500);
    }
    issuedToken = await signJwt({ sub: userId, email, name }, jwtSecret);
  }

  // 3. Create Join Request if not already a member
  const existingMember = await c.env.baby_tracker_db
    .prepare("SELECT id FROM baby_members WHERE baby_id = ? AND user_id = ?")
    .bind(baby.id, userId)
    .first();

  if (!existingMember) {
    const pendingRequest = await c.env.baby_tracker_db
      .prepare(
        "SELECT id FROM invitations WHERE baby_id = ? AND email = ? AND status IN ('pending', 'requested')"
      )
      .bind(baby.id, email)
      .first();

    if (!pendingRequest) {
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
          now + 30 * 24 * 60 * 60,
          "requested",
          userId,
          now
        )
        .run();
    }
  }

  return c.json({
    success: true,
    message: existingMember ? "คุณเป็นสมาชิกอยู่แล้ว" : "ส่งคำขอเข้าร่วมสำเร็จ",
    data: {
      token: issuedToken,
      userId,
      babyId: existingMember ? baby.id : null,
      status: existingMember ? "active" : "requested",
    },
  });
});

export default invitations;
