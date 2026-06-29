import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db"; // Updated to use Drizzle
import { sql } from 'drizzle-orm'; // Import Drizzle operators

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await db.run(sql`SELECT 1`);
    
    return NextResponse.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      database: "connected"
    });
  } catch (error) {
    console.error("بررسی سلامت انجام نشد:", error);
    return NextResponse.json(
      { 
        status: "unhealthy", 
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : "خطای ناشناخته در زمان بررسی سلامت رخ داد"
      },
      { status: 503 }
    );
  }
}