import { Hono } from "hono";
import type { Bindings } from "../types";
import { requireAuth, type AuthVariables } from "../middleware/auth";
import { hashToken } from "../lib/auth";
import { sendInviteEmail } from "../services/email";

const babies = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

babies.use("*", requireAuth);

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const b of bytes) binary += String.fromCodePoint(b);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

async function getMembership(
  db: D1Database,
  babyId: string,
  userId: string
): Promise<{ role: string } | null> {
  const membership: any = await db
    .prepare("SELECT role FROM baby_members WHERE baby_id = ? AND user_id = ?")
    .bind(babyId, userId)
    .first();

  return membership ? { role: membership.role } : null;
}

babies.get("/", async (c) => {
  const user = c.get("user");
  const result = await c.env.baby_tracker_db
    .prepare(
      "SELECT b.* FROM babies b INNER JOIN baby_members bm ON bm.baby_id = b.id WHERE bm.user_id = ? ORDER BY b.created_at DESC"
    )
    .bind(user.sub)
    .all();

  const mappedBabies = (result.results ?? []).map((b: any) => ({
    ...b,
    birthDate: b.birth_date,
    createdAt: b.created_at,
    birth_date: undefined,
    created_at: undefined,
  }));

  return c.json({
    success: true,
    message: "Loaded babies",
    data: mappedBabies,
  });
});

babies.get("/:id", async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");

  const baby: any = await c.env.baby_tracker_db
    .prepare(
      "SELECT b.* FROM babies b INNER JOIN baby_members bm ON bm.baby_id = b.id WHERE b.id = ? AND bm.user_id = ?"
    )
    .bind(id, user.sub)
    .first();

  if (!baby) {
    return c.json({ success: false, message: "Baby not found" }, 404);
  }

  const mappedBaby = {
    ...baby,
    birthDate: baby.birth_date,
    createdAt: baby.created_at,
    birth_date: undefined,
    created_at: undefined,
  };

  return c.json({
    success: true,
    message: "Loaded baby",
    data: mappedBaby,
  });
});

babies.post("/", async (c) => {
  const body = await c.req.json();
  const user = c.get("user");
  const id = crypto.randomUUID();
  const now = nowSeconds();

  await c.env.baby_tracker_db
    .prepare("INSERT INTO babies (id, name, birth_date, gender, weight, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, body.name, body.birthDate, body.gender, body.weight || null, now)
    .run();

  await c.env.baby_tracker_db
    .prepare("INSERT INTO baby_members (id, baby_id, user_id, role, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), id, user.sub, "owner", now)
    .run();

  return c.json(
    {
      success: true,
      message: "Created baby",
      data: { id, ...body, created_at: now },
    },
    201
  );
});

babies.put("/:id", async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const body = await c.req.json();

  const membership = await getMembership(c.env.baby_tracker_db, id, user.sub);
  if (!membership) {
    return c.json({ success: false, message: "Forbidden" }, 403);
  }

  await c.env.baby_tracker_db
    .prepare("UPDATE babies SET name = ?, birth_date = ?, gender = ?, weight = ? WHERE id = ?")
    .bind(body.name, body.birthDate, body.gender, body.weight || null, id)
    .run();

  return c.json(
    {
      success: true,
      message: "Updated baby",
      data: { id, ...body },
    },
    200
  );
});

babies.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");

  const membership = await getMembership(c.env.baby_tracker_db, id, user.sub);
  if (membership?.role !== "owner") {
    return c.json({ success: false, message: "Forbidden" }, 403);
  }

  try {
    // 1. Get all logs for this baby to clean up details first
    const logsResult = await c.env.baby_tracker_db
      .prepare("SELECT id FROM logs WHERE baby_id = ?")
      .bind(id)
      .all();

    const logIds = (logsResult.results ?? []).map((l: any) => l.id);

    if (logIds.length > 0) {
      const placeholders = logIds.map(() => "?").join(",");

      await Promise.all([
        c.env.baby_tracker_db
          .prepare(`DELETE FROM feeding_details WHERE log_id IN (${placeholders})`)
          .bind(...logIds)
          .run(),
        c.env.baby_tracker_db
          .prepare(`DELETE FROM diaper_details WHERE log_id IN (${placeholders})`)
          .bind(...logIds)
          .run(),
        c.env.baby_tracker_db
          .prepare(`DELETE FROM sleep_details WHERE log_id IN (${placeholders})`)
          .bind(...logIds)
          .run(),
        c.env.baby_tracker_db
          .prepare(`DELETE FROM pumping_details WHERE log_id IN (${placeholders})`)
          .bind(...logIds)
          .run(),
      ]);

      await c.env.baby_tracker_db
        .prepare("DELETE FROM logs WHERE baby_id = ?")
        .bind(id)
        .run();
    }

    await c.env.baby_tracker_db.prepare("DELETE FROM invitations WHERE baby_id = ?").bind(id).run();
    await c.env.baby_tracker_db.prepare("DELETE FROM baby_members WHERE baby_id = ?").bind(id).run();

    await c.env.baby_tracker_db.prepare("DELETE FROM babies WHERE id = ?").bind(id).run();

    return c.json(
      {
        success: true,
        message: "Deleted baby",
      },
      200
    );
  } catch (error: any) {
    console.error("Error deleting baby:", error);
    return c.json(
      {
        success: false,
        message: "Failed to delete baby",
        error: error.message,
      },
      500
    );
  }
});

// Caregivers list + pending invites
babies.get("/:id/caregivers", async (c) => {
  const babyId = c.req.param("id");
  const user = c.get("user");

  const membership = await getMembership(c.env.baby_tracker_db, babyId, user.sub);
  if (!membership) {
    return c.json({ success: false, message: "Forbidden" }, 403);
  }

  const now = nowSeconds();
  await c.env.baby_tracker_db
    .prepare("UPDATE invitations SET status = 'expired' WHERE status = 'pending' AND expires_at <= ? AND baby_id = ?")
    .bind(now, babyId)
    .run();

  const membersResult = await c.env.baby_tracker_db
    .prepare(
      "SELECT u.id, u.name, u.email, bm.role, bm.created_at FROM baby_members bm INNER JOIN users u ON u.id = bm.user_id WHERE bm.baby_id = ? ORDER BY bm.created_at ASC"
    )
    .bind(babyId)
    .all();

  const invitesResult = await c.env.baby_tracker_db
    .prepare(
      "SELECT id, email, role, status, expires_at, created_at FROM invitations WHERE baby_id = ? AND status = 'pending' ORDER BY created_at DESC"
    )
    .bind(babyId)
    .all();

  const members = (membersResult.results ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  }));

  const invites = (invitesResult.results ?? []).map((row: any) => ({
    id: row.id,
    email: row.email,
    role: row.role,
    status: row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  }));

  return c.json({
    success: true,
    data: { members, invites },
  });
});

// Create invite (owner only)
babies.post("/:id/invitations", async (c) => {
  const babyId = c.req.param("id");
  const user = c.get("user");
  const body = await c.req.json();
  const email = normalizeEmail(String(body?.email ?? ""));
  const role = "caregiver";

  if (!email) {
    return c.json({ success: false, message: "Email is required" }, 400);
  }

  const membership = await getMembership(c.env.baby_tracker_db, babyId, user.sub);
  if (membership?.role !== "owner") {
    return c.json({ success: false, message: "Forbidden" }, 403);
  }

  const appUrl = c.env.APP_URL || c.req.header("Origin") || "";
  if (!appUrl) {
    return c.json({ success: false, message: "Server misconfigured" }, 500);
  }

  const existingMember = await c.env.baby_tracker_db
    .prepare(
      "SELECT u.id FROM users u INNER JOIN baby_members bm ON bm.user_id = u.id WHERE bm.baby_id = ? AND u.email = ?"
    )
    .bind(babyId, email)
    .first();

  if (existingMember) {
    return c.json({ success: false, message: "User already a member" }, 409);
  }

  const now = nowSeconds();
  const pendingInvite = await c.env.baby_tracker_db
    .prepare(
      "SELECT id FROM invitations WHERE baby_id = ? AND email = ? AND status = 'pending' AND expires_at > ?"
    )
    .bind(babyId, email, now)
    .first();

  if (pendingInvite) {
    return c.json({ success: false, message: "Invite already sent" }, 409);
  }

  const token = generateToken();
  const tokenHash = await hashToken(token);
  const inviteId = crypto.randomUUID();
  const expiresAt = now + 24 * 60 * 60;

  await c.env.baby_tracker_db
    .prepare(
      "INSERT INTO invitations (id, baby_id, email, role, token_hash, expires_at, status, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(inviteId, babyId, email, role, tokenHash, expiresAt, "pending", user.sub, now)
    .run();

  const baby: any = await c.env.baby_tracker_db
    .prepare("SELECT name FROM babies WHERE id = ?")
    .bind(babyId)
    .first();

  const inviteLink = `${appUrl.replace(/\/$/, "")}/invite/${token}`;
  const inviterName = user.name || "Someone";
  const babyName = baby?.name || "your baby";

  try {
    if (c.env.RESEND_API_KEY) {
      await sendInviteEmail(c.env.RESEND_API_KEY, {
        to: email,
        inviteLink,
        inviterName,
        babyName,
      });
    } else {
      console.warn("RESEND_API_KEY not set. Skipping invite email.");
    }
  } catch (error: any) {
    console.error("Invite email failed:", error);
    return c.json({ success: false, message: "Failed to send invite email" }, 500);
  }

  return c.json(
    {
      success: true,
      data: {
        id: inviteId,
        email,
        role,
        status: "pending",
        expiresAt,
        inviteLink: c.env.RESEND_API_KEY ? null : inviteLink,
      },
    },
    201
  );
});

// Revoke invite (owner only)
babies.post("/:id/invitations/:inviteId/revoke", async (c) => {
  const babyId = c.req.param("id");
  const inviteId = c.req.param("inviteId");
  const user = c.get("user");

  const membership = await getMembership(c.env.baby_tracker_db, babyId, user.sub);
  if (membership?.role !== "owner") {
    return c.json({ success: false, message: "Forbidden" }, 403);
  }

  await c.env.baby_tracker_db
    .prepare("UPDATE invitations SET status = 'revoked' WHERE id = ? AND baby_id = ?")
    .bind(inviteId, babyId)
    .run();

  return c.json({ success: true });
});

// Generate Room Code (Owner only)
babies.post("/:id/invite-code", async (c) => {
  const babyId = c.req.param("id");
  const user = c.get("user");

  const membership = await getMembership(c.env.baby_tracker_db, babyId, user.sub);
  if (membership?.role !== "owner") {
    return c.json({ success: false, message: "Forbidden" }, 403);
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = nowSeconds();
  const expiresAt = now + 5 * 60; // 5 minutes

  await c.env.baby_tracker_db
    .prepare("UPDATE babies SET invite_code = ?, invite_expires_at = ? WHERE id = ?")
    .bind(code, expiresAt, babyId)
    .run();

  return c.json({
    success: true,
    data: {
      code,
      expiresAt,
    },
  });
});

// Join via Room Code
babies.post("/invitations/join", async (c) => {
  const body = await c.req.json();
  const { code, role, name, password, email } = body; // email is optional if user already exists (not implemented effectively here yet, assuming new or existing auth flow separate?)
  // Actually, for this flow:
  // 1. User enters code -> We validate code & find baby.
  // 2. If user is NOT logged in, they provide Name & Password to create account OR Login.
  //    Wait, the requirement says "Create User (if needed) or use Auth".
  //    Let's assume the user MIGHT be logged in (token in header) OR providing new credentials.
  //    The prompt says "Input: { code, role, name, password }". This implies creating a NEW user or quick join?
  //    Let's stick to: If no auth header, create new user. If auth header, use existing.

  // BUT, to keep it simple and consistent with current auth:
  // Let's assume this endpoint is called AFTER auth OR it handles registration.
  // The current structure uses `requireAuth` for `babies.use("*", ...)` so this route needs to be PUBLIC if we want unauthenticated access?
  // However, `babies.ts` has `babies.use("*", requireAuth)`.
  // So we might need to move this route OUT or handle auth differently.
  // FIX: define this route BEFORE `babies.use("*", requireAuth)` if possible, OR user must be logged in/registered first?
  // The prompt says: "Create User (if needed) or use Auth".
  // If we are inside `babies.ts`, we are already under auth!
  // So the flow should probably be:
  // 1. Guest goes to site, enters code.
  // 2. Client calls PUBLIC endpoint to validate code & get baby info.
  // 3. Guest Registers/Logins.
  // 4. Guest calls Authenticated endpoint "Join".
  // OR the "Join" endpoint does it all.

  // GIVEN constraints in `babies.ts` (all protected), let's assume the client will:
  // 1. Register/Login the user first (or use generic "Join" flow).
  // 2. Call this endpoint with the Token.
  // Wait, the prompt says "Input: { code, role, name, password }". This implies "Sign up & Join".
  // If so, this route CANNOT be under `requireAuth`.
  // I should probably move this route to `server.ts` or a new `public` router, OR exclude it from auth middleware.

  // For now, let's implement the logic assuming the user IS authenticated (simplest path for `babies.js` structure).
  // If user is NOT authenticated, the Frontend should Register them first (using existing /auth/register), then call this.
  // Let's support: User is already logged in (Token).
  // If the user needs to create an account, the UI does that first.

  // ...Wait, prompt says "Create User (if needed)".
  // I will check if I can modify the router structure. `babies.ts` applies auth to `*`.
  // I'll add a new route file or modify strictness.
  // Actually, I can allow `POST /invitations/join` to be public IF I move it or handle middleware differently.

  // Let's assume the user is ALREADY authenticated for now (simpler migration). 
  // If the requirement strictly implies "One Step Join" (Sign up + Join), I'll need to use the `name` and `password` provided.
  // Let's implement logic to "Find Baby by Code" first.
});

// Remove caregiver (owner only)
babies.delete("/:id/caregivers/:userId", async (c) => {
  const babyId = c.req.param("id");
  const targetUserId = c.req.param("userId");
  const user = c.get("user");

  const membership = await getMembership(c.env.baby_tracker_db, babyId, user.sub);
  if (membership?.role !== "owner") {
    return c.json({ success: false, message: "Forbidden" }, 403);
  }

  const target: any = await c.env.baby_tracker_db
    .prepare("SELECT role FROM baby_members WHERE baby_id = ? AND user_id = ?")
    .bind(babyId, targetUserId)
    .first();

  if (!target) {
    return c.json({ success: false, message: "Member not found" }, 404);
  }

  if (target.role === "owner") {
    return c.json({ success: false, message: "Cannot remove owner" }, 400);
  }

  await c.env.baby_tracker_db
    .prepare("DELETE FROM baby_members WHERE baby_id = ? AND user_id = ?")
    .bind(babyId, targetUserId)
    .run();

  return c.json({ success: true });
});

export default babies;
