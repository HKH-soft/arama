import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const meditationTracks = pgTable("meditation_tracks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  coverArt: text("cover_art").notNull(),
  audioUrl: text("audio_url").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const moodEntries = pgTable("mood_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  mood: integer("mood").notNull(),
  label: text("label").notNull(),
  note: text("note"),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }).defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const exercises = pgTable("exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  difficulty: text("difficulty").notNull(),
  iconName: text("icon_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const exerciseCompletions = pgTable("exercise_completions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
});

export const plans = pgTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  unit: text("unit").notNull(),
  period: text("period").notNull(),
  description: text("description").notNull(),
  cta: text("cta").notNull(),
  featured: boolean("featured").default(false).notNull(),
  features: jsonb("features").$type<string[]>().notNull(),
  sortOrder: integer("sort_order").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id),
  status: text("status").notNull(),
  amount: integer("amount").notNull(),
  interval: text("interval").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  renewsAt: timestamp("renews_at", { withTimezone: true }).notNull(),
});

export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  name: text("name"),
  passwordHash: text("password_hash"),
  passwordSalt: text("password_salt"),
  avatarUrl: text("avatar_url"),
  timezone: text("timezone").default("Asia/Tehran").notNull(),
  remindersEnabled: boolean("reminders_enabled").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const otpCodes = pgTable("otp_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  phone: text("phone").notNull(),
  codeHash: text("code_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  attempts: integer("attempts").default(0).notNull(),
  used: boolean("used").default(false).notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id),
  amount: integer("amount").notNull(),
  authority: text("authority").notNull().unique(),
  refId: text("ref_id"),
  status: text("status").notNull(), // 'pending', 'paid', 'failed'
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ambientTracks = pgTable("ambient_tracks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  coverArt: text("cover_art").notNull(),
  audioUrl: text("audio_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const voiceJournals = pgTable("voice_journals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  transcript: text("transcript").notNull(),
  aiInsight: text("ai_insight").notNull(),
  moodLabel: text("mood_label").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type MeditationTrack = typeof meditationTracks.$inferSelect;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type AmbientTrack = typeof ambientTracks.$inferSelect;
export type VoiceJournal = typeof voiceJournals.$inferSelect;
