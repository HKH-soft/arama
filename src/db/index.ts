import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

// Detect if we should use Cloudflare D1
const isD1 =
  process.env.DB_DRIVER === "d1" ||
  (typeof process.env.DB !== "undefined" &&
    process.env.DB !== null &&
    typeof (process.env.DB as any).prepare === "function");

let _db: any = null;

function getDb() {
  if (_db) return _db;

  if (isD1) {
    const d1Binding = process.env.DB;
    if (!d1Binding) {
      throw new Error("Cloudflare D1 database binding 'DB' is not defined in process.env");
    }
    _db = drizzleD1(d1Binding as any, { schema });
  } else {
    // Dynamically require better-sqlite3 and drizzle-orm/better-sqlite3 to avoid loading them on Cloudflare Edge Runtime
    const Database = require("better-sqlite3");
    const { drizzle: drizzleBetter } = require("drizzle-orm/better-sqlite3");

    const DB_PATH = process.env.DATABASE_URL || "./data/arama.db";

    const getDbPath = (): string => {
      if (DB_PATH.startsWith(":memory:")) return ":memory:";
      return path.isAbsolute(DB_PATH) ? DB_PATH : path.join(/* turbopackIgnore: true */ process.cwd(), DB_PATH);
    };

    const sqlite = new Database(getDbPath());
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
    `);

    _db = drizzleBetter(sqlite, { schema });
  }

  return _db;
}

export const db: BetterSQLite3Database<typeof schema> = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(_target, prop, receiver) {
    const targetDb = getDb();
    return Reflect.get(targetDb, prop, receiver);
  },
});
