/**
 * Schema barrel — re-exports the correct dialect based on DATABASE_DRIVER.
 *   "turso" (default) → schema-sqlite.ts  (libSQL / Turso)
 *   "neon"            → schema-pg.ts      (PostgreSQL / Neon)
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
import type * as SchemaTypes from "./schema-sqlite";

const driver = (process.env.DATABASE_DRIVER || "turso").toLowerCase();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mod: typeof SchemaTypes =
  driver === "neon"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("./schema-pg")
    : // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("./schema-sqlite");

export const users = mod.users;
export const sessions = mod.sessions;
export const accounts = mod.accounts;
export const verifications = mod.verifications;
export const subscriptionPlans = mod.subscriptionPlans;
export const subscriptions = mod.subscriptions;
export const payments = mod.payments;
export const conversations = mod.conversations;
export const messages = mod.messages;
export const auditLogs = mod.auditLogs;
export const exercises = mod.exercises;
export const reports = mod.reports;
export const emotionLogs = mod.emotionLogs;
export const moodEntries = mod.moodEntries;
export const meditationTracks = mod.meditationTracks;
export const blogCategories = mod.blogCategories;
export const blogPosts = mod.blogPosts;
