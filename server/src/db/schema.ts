import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

//  ตารางเด็ก
export const babies = sqliteTable("babies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  birthDate: text("birth_date").notNull(),
  gender: text("gender").notNull(), // 'boy' | 'girl'
  weight: text("weight"), // kg
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

//  ตาราง Log (รวมทุกประเภท)
export const logs = sqliteTable("logs", {
  id: text("id").primaryKey(),
  babyId: text("baby_id").notNull().references(() => babies.id),
  type: text("type").notNull(), // 'feeding' | 'diaper' | 'sleep' | 'pump'
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

//  รายละเอียดการให้นม
export const feedingDetails = sqliteTable("feeding_details", {
  id: text("id").primaryKey(),
  logId: text("log_id").notNull().references(() => logs.id),
  method: text("method").notNull(), // 'bottle' | 'breast'
  bottleContent: text("bottle_content"), // 'formula' | 'breastmilk'
  amountMl: integer("amount_ml"),
  leftDurationSeconds: integer("left_duration_seconds"),
  rightDurationSeconds: integer("right_duration_seconds"),
  hasSpitUp: integer("has_spit_up", { mode: "boolean" }),
  notes: text("notes"),
});

//  รายละเอียดผ้าอ้อม
export const diaperDetails = sqliteTable("diaper_details", {
  id: text("id").primaryKey(),
  logId: text("log_id").notNull().references(() => logs.id),
  status: text("status").notNull(), // 'clean' | 'pee' | 'poo' | 'mixed'
  pooColor: text("poo_color"),
  pooTexture: text("poo_texture"),
  notes: text("notes"),
});

//  รายละเอียดปั๊มนม
export const pumpingDetails = sqliteTable("pumping_details", {
  id: text("id").primaryKey(),
  logId: text("log_id").notNull().references(() => logs.id),
  durationMinutes: integer("duration_minutes").notNull(),
  amountLeftMl: integer("amount_left_ml"),
  amountRightMl: integer("amount_right_ml"),
  amountTotalMl: integer("amount_total_ml").notNull(),
  notes: text("notes"),
});

//  รายละเอียดการนอน
export const sleepDetails = sqliteTable("sleep_details", {
  id: text("id").primaryKey(),
  logId: text("log_id").notNull().references(() => logs.id),
  durationMinutes: integer("duration_minutes").notNull(),
  endTime: integer("end_time", { mode: "timestamp" }),
  notes: text("notes"),
});
