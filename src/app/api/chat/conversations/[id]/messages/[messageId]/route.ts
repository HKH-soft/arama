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
    const user = await requireAuth();
    const clientInfo = getClientInfo(request);
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

    const body = await request.json();
    const parsed = updateMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { content } = parsed.data;

    // Update message
    const updatedMessageResult = await db.update(messages)
      .set({ 
        content: content.trim(),
        updatedAt: new Date() 
      })
      .where(eq(messages.id, messageId))
      .returning();

    // Log audit
    await logAudit({
      userId: user.id,
      action: "MESSAGE_UPDATED",
      entity: "message",
      entityId: messageId,
      metadata: { updatedContentLength: content.length },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json(updatedMessageResult[0]);
  } catch (error) {
    console.error("به‌روزرسانی پیام انجام نشد:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی پیام", details: error instanceof Error ? error.message : "خطای ناشناخته" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const user = await requireAuth();
    const clientInfo = getClientInfo(_request);
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

    // Delete message
    await db.delete(messages).where(eq(messages.id, messageId));

    // Log audit
    await logAudit({
      userId: user.id,
      action: "MESSAGE_DELETED",
      entity: "message",
      entityId: messageId,
      metadata: {},
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json({ message: "پیام با موفقیت حذف شد" });
  } catch (error) {
    console.error("حذف پیام انجام نشد:", error);
    return NextResponse.json(
      { error: "خطا در حذف پیام", details: error instanceof Error ? error.message : "خطای ناشناخته" },
      { status: 500 },
    );
  }
}