import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "../db/schema";
import * as relations from "../db/relations";

// Combined schema+relations object used by both drivers at runtime.
const schemaObj = { ...schema, ...relations };
import * as dotenv from "dotenv";

// Define the possible values for NODE_ENV
type NodeEnv = "development" | "production" | "test" | "staging";

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

// ── Driver selection ──────────────────────────────────────────
const driver = (process.env.DATABASE_DRIVER || "turso").toLowerCase();

// Both drivers expose identical query API. We type `db` as LibSQLDatabase
// (the default driver) so all downstream db.query.* callbacks get proper
// inference. The Neon branch is cast at assignment — runtime is correct.
type AppDb = LibSQLDatabase<typeof schemaObj>;
let db: AppDb;

if (driver === "neon") {
  const sql = neon(process.env.DATABASE_URL!);
  db = drizzleNeonHttp(sql, { schema: schemaObj }) as unknown as AppDb;
} else {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  db = drizzleLibsql(client, { schema: schemaObj });
}

export default db;
