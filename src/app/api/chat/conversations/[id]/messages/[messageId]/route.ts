import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/prisma"; // Updated to use Drizzle
import { conversations, messages } from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc } from 'drizzle-orm'; // Import Drizzle operators

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> },
) {
  try {
    const user = await requireAuth();
    const { id, messageId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    // Check if conversation exists and belongs to user
    const conversationResult = await db.select()
      .from(conversations)
      .where(and(
        eq(conversations.id, id),
        eq(conversations.userId, user.id)
      ));
      
    if (conversationResult.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Check if message exists and belongs to the conversation
    const messageResult = await db.select()
      .from(messages)
      .where(and(
        eq(messages.id, messageId),
        eq(messages.conversationId, id)
      ));
      
    if (messageResult.length === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Update message
    const updatedMessageResult = await db.update(messages)
      .set({ content: content.trim() })
      .where(eq(messages.id, messageId))
      .returning();

    return NextResponse.json(updatedMessageResult[0]);
  } catch (error) {
    console.error("Failed to update message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> },
) {
  try {
    const user = await requireAuth();
    const { id, messageId } = await params;

    // Check if conversation exists and belongs to user
    const conversationResult = await db.select()
      .from(conversations)
      .where(and(
        eq(conversations.id, id),
        eq(conversations.userId, user.id)
      ));
      
    if (conversationResult.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Check if message exists and belongs to the conversation
    const messageResult = await db.select()
      .from(messages)
      .where(and(
        eq(messages.id, messageId),
        eq(messages.conversationId, id)
      ));
      
    if (messageResult.length === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Delete message
    await db.delete(messages).where(eq(messages.id, messageId));

    return NextResponse.json({ message: "Message deleted" });
  } catch (error) {
    console.error("Failed to delete message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 },
    );
  }
}