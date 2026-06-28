import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../db/schema";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Initialize the database - use the same path as in drizzle.config.ts and seed.ts
const dbPath =
  process.env.DATABASE_URL?.replace("file:", "") || "./data/arama.db";

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);

// Create the database instance with Drizzle
const db = drizzle(sqlite, { schema });

export default db;
