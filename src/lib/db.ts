import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../db/schema";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";

// Define the possible values for NODE_ENV
type NodeEnv = 'development' | 'production' | 'test' | 'staging';

// Determine environment and load appropriate .env file
const nodeEnv: NodeEnv = (process.env.NODE_ENV as NodeEnv) || "development";
let envFileName = ".env";

switch (nodeEnv) {
  case "production":
    envFileName = ".env.production";
    break;
  case "staging":
    envFileName = ".env.staging";
    break;
  case "test":
    envFileName = ".env.test";
    break;
  default:
    envFileName = ".env.local"; // Default for development
}

// Load base .env file first (lowest priority)
dotenv.config({ path: ".env" });

// Load environment-specific file (higher priority, overrides .env)
dotenv.config({ path: envFileName });

// Initialize the database - use the same path as in drizzle.config.ts and seed.ts
const dbPath =
  process.env.DATABASE_URL?.replace("file:", "") || "./data/arama.db";

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);

function ensureUserRoleColumn(database: Database.Database) {
  const columns = database.prepare('PRAGMA table_info("user")').all() as Array<{
    name: string;
  }>;

  const hasRoleColumn = columns.some((column) => column.name === "role");

  if (!hasRoleColumn) {
    database.exec(
      'ALTER TABLE "user" ADD COLUMN "role" text NOT NULL DEFAULT "user"',
    );
  }
}

ensureUserRoleColumn(sqlite);

// Create the database instance with Drizzle
const db = drizzle(sqlite, { schema });

export default db;