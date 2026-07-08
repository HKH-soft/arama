/**
 * Driver-aware SQL helpers.
 * Use these instead of raw SQLite / Postgres SQL literals so queries work on both backends.
 */

const driver = (process.env.DATABASE_DRIVER || "turso").toLowerCase();
export const isPg = driver === "neon";

/** SQL expression for "current timestamp" — works in both dialects via drizzle sql tag. */
import { sql } from "drizzle-orm";

/** Current datetime as a JS-friendly string (ISO-8601). */
export const currentTimestamp = isPg
  ? sql<string>`now()`
  : sql<string>`(datetime('now'))`;

/** Current unix-epoch seconds. */
export const currentEpoch = isPg
  ? sql<number>`extract(epoch from now())`
  : sql<number>`(strftime('%s', 'now'))`;

/**
 * DATE() wrapper.
 * SQLite: loggedAt is integer unix-seconds → DATE(col, 'unixepoch')
 * PG:     loggedAt is native timestamp    → DATE(col)
 */
export function dateExpr(col: unknown) {
  return isPg
    ? sql<string>`DATE(${col})`
    : sql<string>`DATE(${col}, 'unixepoch')`;
}

/** Check if an error is a unique-constraint violation (works for both SQLite & PG). */
export function isUniqueViolation(err: any): boolean {
  return (
    err?.code === "SQLITE_CONSTRAINT_UNIQUE" ||
    err?.code === "23505" || // PostgreSQL unique_violation
    err?.constraint?.includes("unique")
  );
}
