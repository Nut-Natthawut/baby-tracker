// เริ่มจาก import และ setup พื้นฐาน
import { Hono } from "hono";

type Bindings = {
  baby_tracker_db: D1Database;
};

const babies = new Hono<{ Bindings: Bindings }>();

babies.get("/" , async (c) => {
    const result = await c.env.baby_tracker_db
    .prepare("SELECT * FROM babies ORDER BY created_at DESC")
    .all();
    return c.json({
    success: true,
    message: "ดึงข้อมูลสำเร็จ",
    data: result.results
    });
})

babies.get("/:id" , async (c) => {
    const id = c.req.param("id");

    const baby = await c.env.baby_tracker_db
    .prepare("SELECT * FROM babies WHERE id = ?")
    .bind(id)
    .first();

    if (!baby) {
    return c.json({ success: false, message: "ไม่พบข้อมูลเด็ก", error: "NOT_FOUND" }, 404);
}
return c.json({
    success: true,
    message: "ดึงข้อมูลสำเร็จ",
    data: baby
    });
})

babies.post("/" , async (c) => {
    const body = await c.req.json();
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    await c.env.baby_tracker_db
    .prepare("INSERT INTO babies (id, name, birth_date, gender, weight, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, body.name, body.birthDate, body.gender, body.weight || null, now)
    .run();

    return c.json({
        succes: true,
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
    await c.env.baby_tracker_db
    .prepare("DELETE FROM babies WHERE id = ?")
    .bind(id)
    .run();
    return c.json({
        success: true,
        message: "ลบข้อมูลสำเร็จ",
    }, 200);
})

export default babies;