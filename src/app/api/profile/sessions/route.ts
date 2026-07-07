import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/profile/sessions
 * Returns the current user's active sessions.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentToken = session.session.token;

    // Fetch all user sessions
    const userSessions = await db.query.sessions.findMany({
      where: (sessions, { eq }) => eq(sessions.userId, session.user.id),
      orderBy: (sessions, { desc }) => [desc(sessions.createdAt)],
    });

    const now = new Date();

    const sessionsData = userSessions.map((s) => ({
      id: s.id,
      device: s.userAgent || "Unknown Device",
      location: "Unknown",
      ip: s.ipAddress || "Unknown",
      lastActivity: s.updatedAt
        ? new Date(s.updatedAt).toLocaleString("fa-IR")
        : "Unknown",
      isActive: s.expiresAt > now,
      isCurrent: s.token === currentToken,
    }));

    return NextResponse.json(sessionsData);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

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
