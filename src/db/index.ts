import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

const DB_PATH = process.env.DATABASE_URL || "./data/arama.db";

function getDbPath(): string {
  if (DB_PATH.startsWith(":memory:")) return ":memory:";
  return path.isAbsolute(DB_PATH) ? DB_PATH : path.join(/* turbopackIgnore: true */ process.cwd(), DB_PATH);
}

let sqlite: Database.Database | null = null;
let _db: BetterSQLite3Database<typeof schema> | null = null;

function getSqlite(): Database.Database {
  if (!sqlite) {
    sqlite = new Database(getDbPath());
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
  }
  return sqlite;
}

export const db: BetterSQLite3Database<typeof schema> = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(_target, prop, receiver) {
    if (!_db) {
      _db = drizzle(getSqlite(), { schema });
    }
    return Reflect.get(_db, prop, receiver);
  },
});
