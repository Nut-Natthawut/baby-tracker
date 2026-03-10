import { Hono } from "hono";
import type { Bindings } from "../types";
import { requireAuth, type AuthVariables } from "../middleware/auth";
import { hashToken } from "../lib/auth";
import { sendInviteEmail } from "../services/email";

const babies = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

babies.use("*", requireAuth);

const OWNER_ROLE = "owner";
const CAREGIVER_ROLE = "caregiver";

function normalizeMemberRole(raw: unknown): typeof OWNER_ROLE | typeof CAREGIVER_ROLE | null {
  if (typeof raw !== "string") return null;
  const role = raw.trim().toLowerCase();
  if (role === OWNER_ROLE || role === "parent") return OWNER_ROLE;
  if (role === CAREGIVER_ROLE) return CAREGIVER_ROLE;
  return null;
}

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
    .prepare(
      `SELECT
        CASE
          WHEN SUM(CASE WHEN lower(trim(role)) IN ('owner', 'parent') THEN 1 ELSE 0 END) > 0 THEN 'owner'
          WHEN SUM(CASE WHEN lower(trim(role)) = 'caregiver' THEN 1 ELSE 0 END) > 0 THEN 'caregiver'
          ELSE NULL
        END AS role
      FROM baby_members
      WHERE baby_id = ? AND user_id = ?`
    )
    .bind(babyId, userId)
    .first();

  if (!membership) return null;
  const role = normalizeMemberRole(membership.role);
  return role ? { role } : null;
}

babies.get("/", async (c) => {
  const user = c.get("user");
  const result = await c.env.baby_tracker_db
    .prepare(
      `SELECT
        b.*,
        CASE
          WHEN MAX(CASE WHEN lower(trim(bm.role)) IN ('owner', 'parent') THEN 2 WHEN lower(trim(bm.role)) = 'caregiver' THEN 1 ELSE 0 END) = 2 THEN 'owner'
          WHEN MAX(CASE WHEN lower(trim(bm.role)) IN ('owner', 'parent') THEN 2 WHEN lower(trim(bm.role)) = 'caregiver' THEN 1 ELSE 0 END) = 1 THEN 'caregiver'
          ELSE NULL
        END AS my_role
      FROM babies b
      INNER JOIN baby_members bm ON bm.baby_id = b.id
      WHERE bm.user_id = ? AND lower(trim(bm.role)) IN ('owner', 'parent', 'caregiver')
      GROUP BY b.id
      ORDER BY b.created_at DESC`
    )
    .bind(user.sub)
    .all();

  const mappedBabies = (result.results ?? []).map((b: any) => ({
    ...b,
    birthDate: b.birth_date,
    createdAt: b.created_at,
    myRole: b.my_role,
    birth_date: undefined,
    created_at: undefined,
    my_role: undefined,
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
      `SELECT
        b.*,
        CASE
          WHEN MAX(CASE WHEN lower(trim(bm.role)) IN ('owner', 'parent') THEN 2 WHEN lower(trim(bm.role)) = 'caregiver' THEN 1 ELSE 0 END) = 2 THEN 'owner'
          WHEN MAX(CASE WHEN lower(trim(bm.role)) IN ('owner', 'parent') THEN 2 WHEN lower(trim(bm.role)) = 'caregiver' THEN 1 ELSE 0 END) = 1 THEN 'caregiver'
          ELSE NULL
        END AS my_role
      FROM babies b
      INNER JOIN baby_members bm ON bm.baby_id = b.id
      WHERE b.id = ? AND bm.user_id = ? AND lower(trim(bm.role)) IN ('owner', 'parent', 'caregiver')
      GROUP BY b.id`
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
    myRole: baby.my_role,
    birth_date: undefined,
    created_at: undefined,
    my_role: undefined,
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
    .bind(crypto.randomUUID(), id, user.sub, OWNER_ROLE, now)
    .run();

  return c.json(
    {
      success: true,
      message: "Created baby",
      data: { id, ...body, myRole: OWNER_ROLE, created_at: now },
    },
    201
  );
});

babies.put("/:id", async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const body = await c.req.json();

  const membership = await getMembership(c.env.baby_tracker_db, id, user.sub);
  if (membership?.role !== OWNER_ROLE) {
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
      data: { id, ...body, myRole: membership.role },
    },
    200
  );
});

babies.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");

  const membership = await getMembership(c.env.baby_tracker_db, id, user.sub);
  if (membership?.role !== OWNER_ROLE) {
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
      `SELECT
        u.id,
        u.name,
        u.email,
        CASE
          WHEN MAX(CASE WHEN lower(trim(bm.role)) IN ('owner', 'parent') THEN 2 WHEN lower(trim(bm.role)) = 'caregiver' THEN 1 ELSE 0 END) = 2 THEN 'owner'
          WHEN MAX(CASE WHEN lower(trim(bm.role)) IN ('owner', 'parent') THEN 2 WHEN lower(trim(bm.role)) = 'caregiver' THEN 1 ELSE 0 END) = 1 THEN 'caregiver'
          ELSE NULL
        END AS role,
        MIN(bm.created_at) AS created_at
      FROM baby_members bm
      INNER JOIN users u ON u.id = bm.user_id
      WHERE bm.baby_id = ? AND lower(trim(bm.role)) IN ('owner', 'parent', 'caregiver')
      GROUP BY u.id, u.name, u.email
      ORDER BY MIN(bm.created_at) ASC`
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
    role: normalizeMemberRole(row.role) ?? CAREGIVER_ROLE,
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
    data: { members, invites, myRole: membership.role },
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
  if (membership?.role !== OWNER_ROLE) {
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
  if (membership?.role !== OWNER_ROLE) {
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
  if (membership?.role !== OWNER_ROLE) {
    return c.json({ success: false, message: "Forbidden" }, 403);
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = nowSeconds();
  const expiresAt = now + 10 * 60; // 10 minutes

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

// Remove caregiver (owner only) or allow caregiver to leave with /:id/caregivers/me
babies.delete("/:id/caregivers/:userId", async (c) => {
  const babyId = c.req.param("id");
  const targetUserId = c.req.param("userId");
  const user = c.get("user");

  const membership = await getMembership(c.env.baby_tracker_db, babyId, user.sub);

  if (targetUserId === "me") {
    if (!membership) {
      return c.json({ success: false, message: "Forbidden" }, 403);
    }

    if (membership.role === OWNER_ROLE) {
      return c.json({ success: false, message: "Owner cannot leave this baby" }, 400);
    }

    await c.env.baby_tracker_db
      .prepare("DELETE FROM baby_members WHERE baby_id = ? AND user_id = ? AND lower(trim(role)) = 'caregiver'")
      .bind(babyId, user.sub)
      .run();

    return c.json({ success: true, message: "Left caregiver role" });
  }

  if (membership?.role !== OWNER_ROLE) {
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

// Get pending requests (owner only)
babies.get("/:id/requests", async (c) => {
  const babyId = c.req.param("id");
  const user = c.get("user");

  const membership = await getMembership(c.env.baby_tracker_db, babyId, user.sub);
  if (membership?.role !== OWNER_ROLE) {
    return c.json({ success: false, message: "Forbidden" }, 403);
  }

  const requestsResult = await c.env.baby_tracker_db
    .prepare(
      "SELECT i.id, i.email, i.role, i.status, i.created_at, u.name as requester_name FROM invitations i INNER JOIN users u ON u.id = i.invited_by WHERE i.baby_id = ? AND i.status = 'requested' ORDER BY i.created_at DESC"
    )
    .bind(babyId)
    .all();

  const requests = (requestsResult.results ?? []).map((row: any) => ({
    id: row.id,
    email: row.email,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    requesterName: row.requester_name,
  }));

  return c.json({ success: true, data: requests });
});

// Approve request (owner only)
babies.post("/:id/requests/:requestId/approve", async (c) => {
  try {
    const babyId = c.req.param("id");
    const requestId = c.req.param("requestId");
    const user = c.get("user");

    const membership = await getMembership(c.env.baby_tracker_db, babyId, user.sub);
    if (membership?.role !== OWNER_ROLE) {
      return c.json({ success: false, message: "Forbidden" }, 403);
    }

    const request: any = await c.env.baby_tracker_db
      .prepare("SELECT * FROM invitations WHERE id = ? AND baby_id = ? AND status = 'requested'")
      .bind(requestId, babyId)
      .first();

    if (!request) {
      return c.json({ success: false, message: "Request not found or already processed" }, 404);
    }

    const now = nowSeconds();

    // Add to baby_members
    const existingMember = await c.env.baby_tracker_db
      .prepare("SELECT id FROM baby_members WHERE baby_id = ? AND user_id = ?")
      .bind(babyId, request.invited_by)
      .first();

    if (!existingMember) {
      const approvedRole = CAREGIVER_ROLE;
      await c.env.baby_tracker_db
        .prepare(
          "INSERT INTO baby_members (id, baby_id, user_id, role, created_at) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(crypto.randomUUID(), babyId, request.invited_by, approvedRole, now)
        .run();
    }

    // Update invitation status to accepted
    await c.env.baby_tracker_db
      .prepare("UPDATE invitations SET status = 'accepted', accepted_at = ? WHERE id = ?")
      .bind(now, requestId)
      .run();

    return c.json({ success: true, message: "Request approved" });
  } catch (error: any) {
    return c.json({ success: false, message: error.message || "Internal server error" }, 500);
  }
});

// Reject request (owner only)
babies.post("/:id/requests/:requestId/reject", async (c) => {
  const babyId = c.req.param("id");
  const requestId = c.req.param("requestId");
  const user = c.get("user");

  const membership = await getMembership(c.env.baby_tracker_db, babyId, user.sub);
  if (membership?.role !== OWNER_ROLE) {
    return c.json({ success: false, message: "Forbidden" }, 403);
  }

  const request: any = await c.env.baby_tracker_db
    .prepare("SELECT * FROM invitations WHERE id = ? AND baby_id = ? AND status = 'requested'")
    .bind(requestId, babyId)
    .first();

  if (!request) {
    return c.json({ success: false, message: "Request not found or already processed" }, 404);
  }

  await c.env.baby_tracker_db
    .prepare("UPDATE invitations SET status = 'expired' WHERE id = ?")  // Or 'rejected' if we had it, but expired serves the same purpose of ignoring it
    .bind(requestId)
    .run();

  return c.json({ success: true, message: "Request rejected" });
});

export default babies;
