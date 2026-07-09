import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db";
import { conversations, messages } from "@/db/schema";
import { eq, and } from 'drizzle-orm';
import { logAudit, getClientInfo } from "@/lib/audit";
import { z } from "zod";

const updateMessageSchema = z.object({
  content: z.string().min(1, "محتوا نمی‌تواند خالی باشد").max(10000, "محتوا نباید بیش از ۱۰۰۰۰ کاراکتر باشد"),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
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
      return NextResponse.json(
        { error: "مکالمه یافت نشد یا متعلق به شما نیست" }, 
        { status: 404 }
      );
    }

    // Check if message exists and belongs to the conversation
    const messageResult = await db.select()
      .from(messages)
      .where(and(
        eq(messages.id, messageId),
        eq(messages.conversationId, id)
      ));
      
    if (messageResult.length === 0) {
      return NextResponse.json(
        { error: "پیام در مکالمه مورد نظر یافت نشد" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(messageResult[0]);
  } catch (error) {
    console.error("دریافت پیام انجام نشد:", error);
    return NextResponse.json(
      { error: "خطا در دریافت پیام", details: error instanceof Error ? error.message : "خطای ناشناخته" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { id: conversationId, messageId } = await params;

    // Verify conversation belongs to user
    const conversation = await db
      .select()
      .from(conversations)
      .where(and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, currentUser.id)
      ));

    if (conversation.length === 0) {
      return NextResponse.json(
        { error: "مکالمه یافت نشد یا دسترسی نامعتبر است" },
        { status: 404 }
      );
    }

    // Get original message for audit
    const originalMessageResult = await db
      .select()
      .from(messages)
      .where(and(
        eq(messages.id, messageId),
        eq(messages.conversationId, conversationId)
      ));

    if (originalMessageResult.length === 0) {
      return NextResponse.json(
        { error: "پیام یافت نشد" },
        { status: 404 }
      );
    }

    const originalMessage = originalMessageResult[0];
    
    // Parse request body and validate with schema
    const body = await request.json();
    const parsed = updateMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { content } = parsed.data;

    // Update only content — never accept role from client
    const updatedMessage = await db
      .update(messages)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(and(
        eq(messages.id, messageId),
        eq(messages.conversationId, conversationId)
      ))
      .returning();

    const clientInfo = await getClientInfo();  // Changed to await
    
    // Log audit
    await logAudit({
      userId: currentUser.id,
      action: "MESSAGE_UPDATED",
      entity: "message",
      entityId: updatedMessage[0].id,
      metadata: {
        conversationId: conversationId,
        oldContent: originalMessage.content,
        newContent: content,
      },
      ipAddress: clientInfo.ipAddress,  // This should now work since clientInfo is awaited
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json(updatedMessage[0]);
  } catch (err) {
    console.error("Update message error:", err);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی پیام", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { id: conversationId, messageId } = await params;

    // Verify conversation belongs to user
    const conversation = await db
      .select()
      .from(conversations)
      .where(and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, currentUser.id)
      ));

    if (conversation.length === 0) {
      return NextResponse.json(
        { error: "مکالمه یافت نشد یا دسترسی نامعتبر است" },
        { status: 404 }
      );
    }

    // Get original message for audit
    const originalMessage = await db
      .select()
      .from(messages)
      .where(and(
        eq(messages.id, messageId),
        eq(messages.conversationId, conversationId)
      ));

    if (originalMessage.length === 0) {
      return NextResponse.json(
        { error: "پیام یافت نشد" },
        { status: 404 }
      );
    }

    // Delete the message
    await db
      .delete(messages)
      .where(eq(messages.id, messageId));

    const clientInfo = await getClientInfo();  // Changed to await
    
    // Log audit
    await logAudit({
      userId: currentUser.id,
      action: "MESSAGE_DELETED",
      entity: "message",
      entityId: messageId,
      metadata: {
        conversationId: conversationId,
        deletedContent: originalMessage[0].content,
        role: originalMessage[0].role,
      },
      ipAddress: clientInfo.ipAddress,  // This should now work since clientInfo is awaited
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete message error:", err);
    return NextResponse.json(
      { error: "خطا در حذف پیام", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}
