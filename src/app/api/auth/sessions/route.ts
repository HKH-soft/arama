import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { 
  sessions
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc } from 'drizzle-orm'; // Import Drizzle operators
import { logAudit, getClientInfo } from "@/lib/audit";
import { z } from "zod";

const createSessionSchema = z.object({
  expiresAt: z.date().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const clientInfo = getClientInfo(request);

    // Fetch user's active sessions with available fields
    const sessionsResult = await db.select({
      id: sessions.id,
      sessionToken: sessions.sessionToken,
      userId: sessions.userId,
      expiresAt: sessions.expires,
    })
    .from(sessions)
    .where(eq(sessions.userId, user.id))
    .orderBy(desc(sessions.expires));

    // Log audit
    await logAudit({
      userId: user.id,
      action: "SESSIONS_LIST_VIEWED",
      entity: "session",
      entityId: user.id,
      metadata: { sessionCount: sessionsResult.length },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json(sessionsResult);
  } catch (err) {
    console.error("Sessions fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت جلسات", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}
