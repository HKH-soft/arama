import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../db/schema";

// Initialize the database - use the same path as in drizzle.config.ts and seed.ts
const sqlite = new Database(process.env.DATABASE_URL || "./db.sqlite");

// Create the database instance with Drizzle
const db = drizzle(sqlite, { schema });

export default db;