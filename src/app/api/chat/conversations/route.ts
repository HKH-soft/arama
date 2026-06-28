import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { conversations } from "@/db/schema"; // Import Drizzle tables
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth();

    const conversationsResult = await db.select()
      .from(conversations)
      .where(eq(conversations.userId, user.id))
      .orderBy(desc(conversations.createdAt));

    return NextResponse.json(conversationsResult);
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}

export async function POST(_request: NextRequest) {
  try {
    const user = await requireAuth();
    const { title } = await _request.json();

    // Create conversation
    const conversationResult = await db.insert(conversations).values({
      id: randomUUID(),
      userId: user.id,
      title: title || "مکالمه جدید",
    }).returning();

    return NextResponse.json(conversationResult[0]);
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 },
    );
  }
}
