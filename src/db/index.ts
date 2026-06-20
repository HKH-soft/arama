import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// ---------------------------------------------------------------------------
// Runtime detection
// ---------------------------------------------------------------------------
const isNode =
  typeof process !== "undefined" &&
  typeof process.versions !== "undefined" &&
  typeof process.versions.node !== "undefined";

// ---------------------------------------------------------------------------
// Database initialisation (lazy — only created on first query)
// ---------------------------------------------------------------------------
let _db: any = null;

function getDb(): any {
  if (_db) return _db;

  if (isNode) {
    // ── Node.js runtime → better-sqlite3 ──────────────────────────────────
    const path = require("path");
    const Database = require("better-sqlite3");
    const { drizzle } = require("drizzle-orm/better-sqlite3");

    const DB_PATH = process.env.DATABASE_URL || "./data/arama.db";
    const dbPath = DB_PATH.startsWith(":memory:")
      ? ":memory:"
      : path.isAbsolute(DB_PATH)
        ? DB_PATH
        : path.join(/* turbopackIgnore: true */ process.cwd(), DB_PATH);

    const sqlite = new Database(dbPath);
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

    _db = drizzle(sqlite, { schema });
  } else {
    // ── Edge / Cloudflare runtime → D1 ────────────────────────────────────
    // getRequestContext() is provided by @opennextjs/cloudflare and gives
    // per-request access to the Cloudflare env bindings (including D1).
    const { getRequestContext } = require("@opennextjs/cloudflare");
    const { drizzle } = require("drizzle-orm/d1");

    const ctx = getRequestContext();
    const d1 = ctx?.env?.DB;

    if (!d1) {
      throw new Error(
        "Cloudflare D1 binding 'DB' not found. " +
          "Add a [[d1_databases]] entry named 'DB' in wrangler.toml."
      );
    }

    _db = drizzle(d1, { schema });
  }

  return _db;
}

// ---------------------------------------------------------------------------
// Lazy proxy — callers import `db` and use it like a normal Drizzle instance.
// The underlying driver is resolved on the first query.
// ---------------------------------------------------------------------------
export const db: BetterSQLite3Database<typeof schema> = new Proxy(
  {} as BetterSQLite3Database<typeof schema>,
  {
    get(_target, prop, receiver) {
      return Reflect.get(getDb(), prop, receiver);
    },
  }
);
