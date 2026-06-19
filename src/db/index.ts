import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

// Helper to get the D1 binding from either process.env or globalThis (Cloudflare global scope)
function getD1Binding(): any {
  if (typeof process.env.DB !== "undefined" && process.env.DB !== null) {
    return process.env.DB;
  }
  if (typeof (globalThis as any).DB !== "undefined" && (globalThis as any).DB !== null) {
    return (globalThis as any).DB;
  }
  return null;
}

// Dynamically check if we should run with Cloudflare D1
function checkIsD1(): boolean {
  if (process.env.DB_DRIVER === "d1") return true;
  const binding = getD1Binding();
  return binding !== null && typeof binding.prepare === "function";
}

let _db: any = null;

function getDb() {
  if (_db) return _db;

  if (checkIsD1()) {
    const d1Binding = getD1Binding();
    if (!d1Binding) {
      throw new Error(
        "Cloudflare D1 database binding 'DB' is not defined in process.env or globalThis. " +
        "Please ensure you have configured a D1 database binding named 'DB'."
      );
    }
    _db = drizzleD1(d1Binding, { schema });
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
