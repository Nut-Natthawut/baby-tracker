import { Hono } from "hono";
import type { Bindings } from "../types";
import { hashPassword, signJwt, verifyPassword } from "../lib/auth";
import { requireAuth, type AuthVariables } from "../middleware/auth";

const auth = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

auth.post("/signup", async (c) => {
  const body = await c.req.json();
  const email = normalizeEmail(String(body?.email ?? ""));
  const password = String(body?.password ?? "");
  const name = body?.name ? String(body.name).trim() : null;

  if (!email || !password) {
    return c.json({ success: false, message: "Email and password are required" }, 400);
  }

  if (!c.env.JWT_SECRET) {
    return c.json({ success: false, message: "Server misconfigured" }, 500);
  }

  const existing = await c.env.baby_tracker_db
    .prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first();

  if (existing) {
    return c.json({ success: false, message: "Email already in use" }, 409);
  }

  const userId = crypto.randomUUID();
  const now = nowSeconds();
  const passwordHash = await hashPassword(password);

  await c.env.baby_tracker_db
    .prepare(
      "INSERT INTO users (id, email, password_hash, name, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(userId, email, passwordHash, name, now, now)
    .run();

  // If no memberships exist yet, claim all existing babies as owner for the first user.
  const memberCountRow: any = await c.env.baby_tracker_db
    .prepare("SELECT COUNT(*) as count FROM baby_members")
    .first();

  const memberCount = Number(memberCountRow?.count ?? 0);
  if (memberCount === 0) {
    const babies = await c.env.baby_tracker_db.prepare("SELECT id FROM babies").all();
    for (const baby of (babies.results ?? []) as any[]) {
      await c.env.baby_tracker_db
        .prepare(
          "INSERT INTO baby_members (id, baby_id, user_id, role, created_at) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(crypto.randomUUID(), baby.id, userId, "owner", now)
        .run();
    }
  }

  const token = await signJwt({ sub: userId, email, name }, c.env.JWT_SECRET);

  return c.json(
    {
      success: true,
      data: {
        token,
        user: { id: userId, email, name },
      },
    },
    201
  );
});

auth.post("/login", async (c) => {
  const body = await c.req.json();
  const email = normalizeEmail(String(body?.email ?? ""));
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return c.json({ success: false, message: "Email and password are required" }, 400);
  }

  if (!c.env.JWT_SECRET) {
    return c.json({ success: false, message: "Server misconfigured" }, 500);
  }

  const user: any = await c.env.baby_tracker_db
    .prepare("SELECT id, email, password_hash, name FROM users WHERE email = ?")
    .bind(email)
    .first();

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return c.json({ success: false, message: "Invalid credentials" }, 401);
  }

  const now = nowSeconds();
  await c.env.baby_tracker_db
    .prepare("UPDATE users SET last_login_at = ? WHERE id = ?")
    .bind(now, user.id)
    .run();

  const token = await signJwt({ sub: user.id, email: user.email, name: user.name }, c.env.JWT_SECRET);

  return c.json({
    success: true,
    data: {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    },
  });
});

auth.get("/me", requireAuth, async (c) => {
  const user = c.get("user");
  const row: any = await c.env.baby_tracker_db
    .prepare("SELECT id, email, name FROM users WHERE id = ?")
    .bind(user.sub)
    .first();

  if (!row) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }

  return c.json({
    success: true,
    data: { id: row.id, email: row.email, name: row.name },
  });
});

auth.post("/logout", (c) => {
  return c.json({ success: true });
});

export default auth;
