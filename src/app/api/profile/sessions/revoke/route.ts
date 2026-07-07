import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/profile/sessions/revoke
 * Revokes a specific session for the current user.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 },
      );
    }

    // Verify session belongs to user
    const sessionToDelete = await db.query.sessions.findFirst({
      where: (sessions, { and, eq }) =>
        and(eq(sessions.id, sessionId), eq(sessions.userId, session.user.id)),
    });

    if (!sessionToDelete) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Delete the session
    await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}