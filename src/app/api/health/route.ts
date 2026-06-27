import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma"; // Updated to use Drizzle
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
    console.error("Health check failed:", error);
    return NextResponse.json(
      { 
        status: "unhealthy", 
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 503 }
    );
  }
}