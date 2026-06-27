import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { 
  sessions,
  users
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc } from 'drizzle-orm'; // Import Drizzle operators
import { logAudit, getClientInfo } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const clientInfo = getClientInfo(request);
    
    // Fetch user's active sessions
    const userSessions = await db.select({
      id: sessions.id,
      userId: sessions.userId,
      expiresAt: sessions.expires,
    })
    .from(sessions)
    .where(eq(sessions.userId, user.id))
    .orderBy(desc(sessions.expires)); // Most recent first
    
    // Log audit
    await logAudit({
      userId: user.id,
      action: "SESSIONS_LIST_VIEWED",
      entity: "session",
      entityId: user.id,
      metadata: { sessionCount: userSessions.length },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });
    
    return NextResponse.json(userSessions);
  } catch (err) {
    console.error("Sessions fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت جلسات", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}