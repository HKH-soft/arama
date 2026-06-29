import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db";
import { sessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { logAudit, getClientInfo } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const clientInfo = getClientInfo(request);

    const sessionsResult = await db
      .select({
        sessionToken: sessions.sessionToken,
        userId: sessions.userId,
        expiresAt: sessions.expires,
      })
      .from(sessions)
      .where(eq(sessions.userId, user.id))
      .orderBy(desc(sessions.expires));

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
      {
        error: "خطا در دریافت جلسات",
        details: err instanceof Error ? err.message : "خطای ناشناخته",
      },
      { status: 500 },
    );
  }
}
