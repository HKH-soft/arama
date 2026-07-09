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
        error: error instanceof Error
          ? { message: error.message, name: error.name }
          : "خطای ناشناخته در زمان بررسی سلامت رخ داد",
      },
      { status: 503 },
    );
  }
}