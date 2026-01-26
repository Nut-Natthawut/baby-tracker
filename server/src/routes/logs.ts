import { Hono } from "hono";
import type { Bindings } from "../types";
import { requireAuth, type AuthVariables } from "../middleware/auth";

const logs = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

logs.use("*", requireAuth);

async function getMembership(db: D1Database, babyId: string, userId: string) {
  return db
    .prepare("SELECT role FROM baby_members WHERE baby_id = ? AND user_id = ?")
    .bind(babyId, userId)
    .first();
}

// GET /:babyId/details - Get all logs with details for a baby
logs.get("/:babyId/details", async (c) => {
  const babyId = c.req.param("babyId");
  const user = c.get("user");

  const membership = await getMembership(c.env.baby_tracker_db, babyId, user.sub);
  if (!membership) {
    return c.json({ success: false, message: "Forbidden" }, 403);
  }

  const logsResult = await c.env.baby_tracker_db
    .prepare("SELECT * FROM logs WHERE baby_id = ? ORDER BY timestamp DESC")
    .bind(babyId)
    .all();

  if (!logsResult.results || logsResult.results.length === 0) {
    return c.json({ success: true, data: [] });
  }

  const logsData = logsResult.results as any[];
  const logIds = logsData.map((l) => l.id);
  const placeholders = logIds.map(() => "?").join(",");

  const [feedings, diapers, sleeps, pumps] = await Promise.all([
    c.env.baby_tracker_db
      .prepare(`SELECT * FROM feeding_details WHERE log_id IN (${placeholders})`)
      .bind(...logIds)
      .all(),
    c.env.baby_tracker_db
      .prepare(`SELECT * FROM diaper_details WHERE log_id IN (${placeholders})`)
      .bind(...logIds)
      .all(),
    c.env.baby_tracker_db
      .prepare(`SELECT * FROM sleep_details WHERE log_id IN (${placeholders})`)
      .bind(...logIds)
      .all(),
    c.env.baby_tracker_db
      .prepare(`SELECT * FROM pumping_details WHERE log_id IN (${placeholders})`)
      .bind(...logIds)
      .all(),
  ]);

  const feedingMap = new Map((feedings.results as any[]).map((d) => [d.log_id, d]));
  const diaperMap = new Map((diapers.results as any[]).map((d) => [d.log_id, d]));
  const sleepMap = new Map((sleeps.results as any[]).map((d) => [d.log_id, d]));
  const pumpMap = new Map((pumps.results as any[]).map((d) => [d.log_id, d]));

  const enrichedLogs = logsData.map((log) => {
    let details = {};
    switch (log.type) {
      case "feeding":
        details = feedingMap.get(log.id) || {};
        break;
      case "diaper":
        details = diaperMap.get(log.id) || {};
        break;
      case "sleep":
        details = sleepMap.get(log.id) || {};
        break;
      case "pump":
        details = pumpMap.get(log.id) || {};
        break;
    }

    const { log_id, id: detailId, ...cleanDetails } = details as any;
    const camelCaseDetails = convertKeysToCamelCase(cleanDetails);

    return {
      id: log.id,
      babyId: log.baby_id,
      type: log.type,
      timestamp: log.timestamp,
      details: camelCaseDetails,
    };
  });

  return c.json({
    success: true,
    data: enrichedLogs,
  });
});

function convertKeysToCamelCase(obj: any): any {
  const newObj: any = {};
  for (const key in obj) {
    const newKey = key.replaceAll(/_([a-z])/g, (g) => g[1].toUpperCase());
    newObj[newKey] = obj[key];
  }
  return newObj;
}

// POST / - Create a new log
logs.post("/", async (c) => {
  const body = await c.req.json();
  const user = c.get("user");

  const id = crypto.randomUUID();
  const detailId = crypto.randomUUID();
  const created_at = Math.floor(Date.now() / 1000);

  const { babyId, type, timestamp, details } = body;

  if (!babyId || !type || !timestamp) {
    return c.json({ success: false, message: "Missing log fields" }, 400);
  }

  const membership = await getMembership(c.env.baby_tracker_db, babyId, user.sub);
  if (!membership) {
    return c.json({ success: false, message: "Forbidden" }, 403);
  }

  try {
    await c.env.baby_tracker_db
      .prepare("INSERT INTO logs (id, baby_id, type, timestamp, created_at) VALUES (?, ?, ?, ?, ?)")
      .bind(id, babyId, type, timestamp, created_at)
      .run();

    if (type === "feeding") {
      await c.env.baby_tracker_db
        .prepare(
          "INSERT INTO feeding_details (id, log_id, method, bottle_content, amount_ml, left_duration_seconds, right_duration_seconds, has_spit_up, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(
          detailId,
          id,
          details.method,
          details.bottleContent ?? null,
          details.amountMl ?? null,
          details.leftDurationSeconds ?? null,
          details.rightDurationSeconds ?? null,
          details.hasSpitUp ? 1 : 0,
          details.notes ?? null
        )
        .run();
    } else if (type === "diaper") {
      await c.env.baby_tracker_db
        .prepare(
          "INSERT INTO diaper_details (id, log_id, status, poo_color, poo_texture, notes) VALUES (?, ?, ?, ?, ?, ?)"
        )
        .bind(
          detailId,
          id,
          details.status,
          details.pooColor ?? null,
          details.pooTexture ?? null,
          details.notes ?? null
        )
        .run();
    } else if (type === "sleep") {
      await c.env.baby_tracker_db
        .prepare(
          "INSERT INTO sleep_details (id, log_id, duration_minutes, end_time, notes) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(detailId, id, details.durationMinutes, details.endTime ?? null, details.notes ?? null)
        .run();
    } else if (type === "pump") {
      await c.env.baby_tracker_db
        .prepare(
          "INSERT INTO pumping_details (id, log_id, duration_minutes, amount_left_ml, amount_right_ml, amount_total_ml, notes) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(
          detailId,
          id,
          details.durationMinutes,
          details.amountLeftMl ?? null,
          details.amountRightMl ?? null,
          details.amountTotalMl,
          details.notes ?? null
        )
        .run();
    }

    return c.json(
      {
        success: true,
        message: "Saved log",
        data: {
          id,
          babyId,
          type,
          timestamp,
          details,
        },
      },
      201
    );
  } catch (err: any) {
    console.error("Error creating log:", err);
    return c.json({ success: false, message: "Failed to create log", error: err.message }, 500);
  }
});

// DELETE /:id - Delete a log
logs.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");

  const log: any = await c.env.baby_tracker_db
    .prepare("SELECT id, type, baby_id FROM logs WHERE id = ?")
    .bind(id)
    .first();

  if (!log) {
    return c.json({ success: false, message: "Log not found" }, 404);
  }

  const membership = await getMembership(c.env.baby_tracker_db, log.baby_id, user.sub);
  if (!membership) {
    return c.json({ success: false, message: "Forbidden" }, 403);
  }

  const type = log.type;

  try {
    if (type === "feeding")
      await c.env.baby_tracker_db.prepare("DELETE FROM feeding_details WHERE log_id = ?").bind(id).run();
    else if (type === "diaper")
      await c.env.baby_tracker_db.prepare("DELETE FROM diaper_details WHERE log_id = ?").bind(id).run();
    else if (type === "sleep")
      await c.env.baby_tracker_db.prepare("DELETE FROM sleep_details WHERE log_id = ?").bind(id).run();
    else if (type === "pump")
      await c.env.baby_tracker_db.prepare("DELETE FROM pumping_details WHERE log_id = ?").bind(id).run();

    await c.env.baby_tracker_db.prepare("DELETE FROM logs WHERE id = ?").bind(id).run();

    return c.json({ success: true, message: "Deleted log" });
  } catch (err: any) {
    return c.json({ success: false, message: "Failed to delete log", error: err.message }, 500);
  }
});

export default logs;
