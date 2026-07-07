import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import path from "path";

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

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
