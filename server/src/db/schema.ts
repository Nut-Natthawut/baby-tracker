import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

//  ตารางเด็ก
export const babies = sqliteTable("babies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  birthDate: text("birth_date").notNull(),
  gender: text("gender").notNull(), // 'boy' | 'girl'
  weight: text("weight"), // kg
  inviteCode: text("invite_code"), // Room code for joining (6 digits)
  inviteExpiresAt: integer("invite_expires_at", { mode: "timestamp" }), // Expiry for the code
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

//  Users (auth)
export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
  })
);

//  ตาราง Log (รวมทุกประเภท)
export const logs = sqliteTable("logs", {
  id: text("id").primaryKey(),
  babyId: text("baby_id").notNull().references(() => babies.id),
  type: text("type").notNull(), // 'feeding' | 'diaper' | 'sleep' | 'pump'
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

//  สมาชิกของเด็ก
export const babyMembers = sqliteTable(
  "baby_members",
  {
    id: text("id").primaryKey(),
    babyId: text("baby_id").notNull().references(() => babies.id),
    userId: text("user_id").notNull().references(() => users.id),
    role: text("role").notNull(), // 'owner' | 'caregiver'
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => ({
    babyUserUnique: uniqueIndex("baby_members_baby_user_unique").on(table.babyId, table.userId),
    babyIdx: index("baby_members_baby_id_idx").on(table.babyId),
    userIdx: index("baby_members_user_id_idx").on(table.userId),
  })
);

//  คำเชิญผู้ดูแล
export const invitations = sqliteTable(
  "invitations",
  {
    id: text("id").primaryKey(),
    babyId: text("baby_id").notNull().references(() => babies.id),
    email: text("email").notNull(),
    role: text("role").notNull(), // 'caregiver'
    tokenHash: text("token_hash").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    status: text("status").notNull(), // 'pending' | 'accepted' | 'revoked' | 'expired'
    invitedBy: text("invited_by").notNull().references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    acceptedAt: integer("accepted_at", { mode: "timestamp" }),
  },
  (table) => ({
    tokenHashUnique: uniqueIndex("invitations_token_hash_unique").on(table.tokenHash),
    babyIdx: index("invitations_baby_id_idx").on(table.babyId),
    emailIdx: index("invitations_email_idx").on(table.email),
  })
);

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
