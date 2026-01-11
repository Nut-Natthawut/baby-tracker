import { Hono } from "hono";

type Bindings = {
    baby_tracker_db: D1Database;
};

const logs = new Hono<{ Bindings: Bindings }>();

// GET /:babyId/details - Get all logs with details for a baby
logs.get("/:babyId/details", async (c) => {
    const babyId = c.req.param("babyId");

    // 1. Get all logs
    const logsResult = await c.env.baby_tracker_db
        .prepare("SELECT * FROM logs WHERE baby_id = ? ORDER BY timestamp DESC")
        .bind(babyId)
        .all();

    if (!logsResult.results || logsResult.results.length === 0) {
        return c.json({ success: true, data: [] });
    }

    const logsData = logsResult.results as any[];
    const logIds = logsData.map(l => l.id);

    // 2. Fetch details from all tables for these logs
    // To avoid N+1, we could fetch all relevant details or just one by one if batching isn't easy.
    // Given D1 limitations (no complex ORM lazily available), and simple scale, 
    // we can just fetch all details for these IDs from each table.
    // Constructing a "IN (...)" clause manually.

    const placeholders = logIds.map(() => "?").join(",");

    const [feedings, diapers, sleeps, pumps] = await Promise.all([
        c.env.baby_tracker_db.prepare(`SELECT * FROM feeding_details WHERE log_id IN (${placeholders})`).bind(...logIds).all(),
        c.env.baby_tracker_db.prepare(`SELECT * FROM diaper_details WHERE log_id IN (${placeholders})`).bind(...logIds).all(),
        c.env.baby_tracker_db.prepare(`SELECT * FROM sleep_details WHERE log_id IN (${placeholders})`).bind(...logIds).all(),
        c.env.baby_tracker_db.prepare(`SELECT * FROM pumping_details WHERE log_id IN (${placeholders})`).bind(...logIds).all()
    ]);

    // 3. Map details to logs
    const feedingMap = new Map((feedings.results as any[]).map(d => [d.log_id, d]));
    const diaperMap = new Map((diapers.results as any[]).map(d => [d.log_id, d]));
    const sleepMap = new Map((sleeps.results as any[]).map(d => [d.log_id, d]));
    const pumpMap = new Map((pumps.results as any[]).map(d => [d.log_id, d]));

    const enrichedLogs = logsData.map(log => {
        let details = {};
        switch (log.type) {
            case 'feeding': details = feedingMap.get(log.id) || {}; break;
            case 'diaper': details = diaperMap.get(log.id) || {}; break;
            case 'sleep': details = sleepMap.get(log.id) || {}; break;
            case 'pump': details = pumpMap.get(log.id) || {}; break;
        }
        // Remove log_id from details to keep it clean, optional
        const { log_id, id: detailId, ...cleanDetails } = details as any;

        // Map snake_case to camelCase manually if needed?
        // The frontend seems to expect whatever came from DB or use standard JS.
        // The schema uses snake_case for DB columns (e.g. amount_ml).
        // The frontend code `useBabyData` line 49 just spreads `...log`.
        // But `addLog` sends camelCase in `details: data.details`.
        // The DB schema `schema.ts` defines snake_case columns.
        // We should probably normalize to camelCase for frontend consistency, 
        // OR ensure frontend handles snake_case.
        // Looking at useBabyData, it doesn't seem to do conversion.
        // Let's check `useBabyData` usages... not visible.
        // SAFEST: Convert snake_case from DB back to camelCase for the frontend response.

        return {
            id: log.id,
            babyId: log.baby_id,
            type: log.type,
            timestamp: log.timestamp,
            details: convertKeysToCamelCase(cleanDetails)
        };
    });

    return c.json({
        success: true,
        data: enrichedLogs
    });
});

// Helper to convert snake_case keys to camelCase
function convertKeysToCamelCase(obj: any): any {
    const newObj: any = {};
    for (const key in obj) {
        const newKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        newObj[newKey] = obj[key];
    }
    return newObj;
}

// POST / - Create a new log
logs.post("/", async (c) => {
    const body = await c.req.json();
    // Expect body: { babyId, type, timestamp, details: { ... } }

    const id = crypto.randomUUID();
    const detailId = crypto.randomUUID();
    const created_at = Math.floor(Date.now() / 1000); // Unix timestamp

    const { babyId, type, timestamp, details } = body;

    try {
        // 1. Insert into logs table
        await c.env.baby_tracker_db.prepare(
            "INSERT INTO logs (id, baby_id, type, timestamp, created_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(id, babyId, type, timestamp, created_at).run();

        // 2. Insert into specific detail table based on type
        if (type === 'feeding') {
            await c.env.baby_tracker_db.prepare(
                "INSERT INTO feeding_details (id, log_id, method, bottle_content, amount_ml, left_duration_seconds, right_duration_seconds, has_spit_up, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
            ).bind(detailId, id, details.method, details.bottleContent ?? null, details.amountMl ?? null, details.leftDurationSeconds ?? null, details.rightDurationSeconds ?? null, details.hasSpitUp ? 1 : 0, details.notes ?? null).run();
        } else if (type === 'diaper') {
            await c.env.baby_tracker_db.prepare(
                "INSERT INTO diaper_details (id, log_id, status, poo_color, poo_texture, notes) VALUES (?, ?, ?, ?, ?, ?)"
            ).bind(detailId, id, details.status, details.pooColor ?? null, details.pooTexture ?? null, details.notes ?? null).run();
        } else if (type === 'sleep') {
            await c.env.baby_tracker_db.prepare(
                "INSERT INTO sleep_details (id, log_id, duration_minutes, end_time, notes) VALUES (?, ?, ?, ?, ?)"
            ).bind(detailId, id, details.durationMinutes, details.endTime ?? null, details.notes ?? null).run();
        } else if (type === 'pump') {
            await c.env.baby_tracker_db.prepare(
                "INSERT INTO pumping_details (id, log_id, duration_minutes, amount_left_ml, amount_right_ml, amount_total_ml, notes) VALUES (?, ?, ?, ?, ?, ?, ?)"
            ).bind(detailId, id, details.durationMinutes, details.amountLeftMl ?? null, details.amountRightMl ?? null, details.amountTotalMl, details.notes ?? null).run();
        }

        return c.json({
            success: true,
            message: "Saved log",
            data: {
                id,
                babyId,
                type,
                timestamp,
                details // return back what was sent
            }
        }, 201);
    } catch (err: any) {
        console.error("Error creating log:", err);
        return c.json({ success: false, message: "Failed to create log", error: err.message }, 500);
    }
});

// DELETE /:id - Delete a log
logs.delete("/:id", async (c) => {
    const id = c.req.param("id");

    // We need to delete from detail tables first (if no cascade)
    // Brute force delete from all details where log_id matches (safest if we don't query type first)
    // Or just query type first.

    const log = await c.env.baby_tracker_db.prepare("SELECT type FROM logs WHERE id = ?").bind(id).first();

    if (!log) {
        return c.json({ success: false, message: "Log not found" }, 404);
    }

    const type = (log as any).type;

    try {
        if (type === 'feeding') await c.env.baby_tracker_db.prepare("DELETE FROM feeding_details WHERE log_id = ?").bind(id).run();
        else if (type === 'diaper') await c.env.baby_tracker_db.prepare("DELETE FROM diaper_details WHERE log_id = ?").bind(id).run();
        else if (type === 'sleep') await c.env.baby_tracker_db.prepare("DELETE FROM sleep_details WHERE log_id = ?").bind(id).run();
        else if (type === 'pump') await c.env.baby_tracker_db.prepare("DELETE FROM pumping_details WHERE log_id = ?").bind(id).run();

        await c.env.baby_tracker_db.prepare("DELETE FROM logs WHERE id = ?").bind(id).run();

        return c.json({ success: true, message: "Deleted log" });
    } catch (err: any) {
        return c.json({ success: false, message: "Failed to delete log", error: err.message }, 500);
    }
});

export default logs;
