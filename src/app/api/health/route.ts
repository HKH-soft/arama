import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { users } from "@/db/schema";

export async function GET(_request: NextRequest) {
  try {
    // Test database connection — works with both Turso/sqlite and Neon/PG drivers
    await db.select().from(users).limit(1);

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    console.error("بررسی سلامت انجام نشد:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: "خطای ناشناخته در بررسی سلامت",
      },
      { status: 503 },
    );
  }
}
