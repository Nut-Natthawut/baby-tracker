// เริ่มจาก import และ setup พื้นฐาน
import { Hono } from "hono";

type Bindings = {
    baby_tracker_db: D1Database;
};

const babies = new Hono<{ Bindings: Bindings }>();

babies.get("/", async (c) => {
    const result = await c.env.baby_tracker_db
        .prepare("SELECT * FROM babies ORDER BY created_at DESC")
        .all();

    const mappedBabies = result.results.map((b: any) => ({
        ...b,
        birthDate: b.birth_date,
        createdAt: b.created_at,
        birth_date: undefined,
        created_at: undefined
    }));

    return c.json({
        success: true,
        message: "ดึงข้อมูลสำเร็จ",
        data: mappedBabies
    });
})

babies.get("/:id", async (c) => {
    const id = c.req.param("id");

    const baby: any = await c.env.baby_tracker_db
        .prepare("SELECT * FROM babies WHERE id = ?")
        .bind(id)
        .first();

    if (!baby) {
        return c.json({ success: false, message: "ไม่พบข้อมูลเด็ก", error: "NOT_FOUND" }, 404);
    }

    const mappedBaby = {
        ...baby,
        birthDate: baby.birth_date,
        createdAt: baby.created_at,
        birth_date: undefined,
        created_at: undefined
    };

    return c.json({
        success: true,
        message: "ดึงข้อมูลสำเร็จ",
        data: mappedBaby
    });
})

babies.post("/", async (c) => {
    const body = await c.req.json();
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await c.env.baby_tracker_db
        .prepare("INSERT INTO babies (id, name, birth_date, gender, weight, created_at) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(id, body.name, body.birthDate, body.gender, body.weight || null, now)
        .run();

    return c.json({
        success: true,
        message: "เพิ่มข้อมูลสำเร็จ",
        data: { id, ...body, created_at: now }
    }, 201);
})

babies.put("/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();

    await c.env.baby_tracker_db
        .prepare("UPDATE babies SET name = ?, birth_date = ?, gender = ?, weight = ? WHERE id = ?")
        .bind(body.name, body.birthDate, body.gender, body.weight || null, id)
        .run();

    return c.json({
        success: true,
        message: "อัปเดตข้อมูลสำเร็จ",
        data: { id, ...body }
    }, 200);
})

babies.delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
        // 1. Get all logs for this baby to clean up details first
        const logsResult = await c.env.baby_tracker_db
            .prepare("SELECT id FROM logs WHERE baby_id = ?")
            .bind(id)
            .all();

        const logIds = (logsResult.results || []).map((l: any) => l.id);

        if (logIds.length > 0) {
            // Delete from all detail tables using IN clause
            const placeholders = logIds.map(() => "?").join(",");

            // Execute deletes for details
            await Promise.all([
                c.env.baby_tracker_db.prepare(`DELETE FROM feeding_details WHERE log_id IN (${placeholders})`).bind(...logIds).run(),
                c.env.baby_tracker_db.prepare(`DELETE FROM diaper_details WHERE log_id IN (${placeholders})`).bind(...logIds).run(),
                c.env.baby_tracker_db.prepare(`DELETE FROM sleep_details WHERE log_id IN (${placeholders})`).bind(...logIds).run(),
                c.env.baby_tracker_db.prepare(`DELETE FROM pumping_details WHERE log_id IN (${placeholders})`).bind(...logIds).run()
            ]);

            // 2. Delete logs
            await c.env.baby_tracker_db
                .prepare("DELETE FROM logs WHERE baby_id = ?")
                .bind(id)
                .run();
        }

        // 3. Delete baby
        await c.env.baby_tracker_db
            .prepare("DELETE FROM babies WHERE id = ?")
            .bind(id)
            .run();

        return c.json({
            success: true,
            message: "ลบข้อมูลสำเร็จ",
        }, 200);
    } catch (error: any) {
        console.error("Error deleting baby:", error);
        return c.json({
            success: false,
            message: "เกิดข้อผิดพลาดในการลบข้อมูล",
            error: error.message
        }, 500);
    }
})

export default babies;