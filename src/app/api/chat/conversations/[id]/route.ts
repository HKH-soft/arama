import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { conversations, messages } from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc } from 'drizzle-orm'; // Import Drizzle operators

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

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

    const conversation = conversationResult[0];

    // Get messages for the conversation
    const messageResults = await db.select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt));

    return NextResponse.json({ ...conversation, messages: messageResults });
  } catch (error) {
    console.error("Failed to fetch conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
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

    // Update conversation
    const updatedConversationResult = await db.update(conversations)
      .set({ title: title.trim() })
      .where(eq(conversations.id, id))
      .returning();

    return NextResponse.json(updatedConversationResult[0]);
  } catch (error) {
    console.error("Failed to update conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

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

    // Delete conversation and its messages
    await db.delete(conversations).where(eq(conversations.id, id));

    return NextResponse.json({ message: "Conversation deleted" });
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 },
    );
  }
}