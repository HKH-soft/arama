import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check if the database connection works
    await db.execute(sql`select 1`);

    // Check if critical tables exist
    // If rate_limits (the newest table) doesn't exist, this will throw an error
    await db.execute(sql`SELECT count(*) FROM rate_limits LIMIT 1`);
    await db.execute(sql`SELECT count(*) FROM profiles LIMIT 1`);
    await db.execute(sql`SELECT count(*) FROM conversations LIMIT 1`);

    return NextResponse.json({
      status: "ok",
      database: "connected",
      migrations: "up-to-date",
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorDetails = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error("[HEALTH CHECK FAILED]", errorDetails, error);
    
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected_or_missing_tables",
        error: errorDetails,
        remediation: "Run `npm run db:migrate` against your production DATABASE_URL to create missing tables.",
      },
      { status: 500 }
    );
  }
}
