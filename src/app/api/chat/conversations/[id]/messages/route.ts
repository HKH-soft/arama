import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { conversations, messages } from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc } from 'drizzle-orm'; // Import Drizzle operators
import Anthropic from "@anthropic-ai/sdk";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { content } = await request.json();

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "محتوا نمی‌تواند خالی باشد" }, { status: 400 });
    }

    // Check if conversation exists and belongs to user
    const conversationResult = await db.select()
      .from(conversations)
      .where(and(
        eq(conversations.id, id),
        eq(conversations.userId, user.id)
      ));
      
    if (conversationResult.length === 0) {
      return NextResponse.json({ error: "مکالمه یافت نشد یا متعلق به شما نیست" }, { status: 404 });
    }

    // Create user message
    const userMessageResult = await db.insert(messages).values({
      id: crypto.randomUUID(),
      conversationId: id,
      content: content.trim(),
      role: "user",
    }).returning();

    // Get all messages in the conversation for context
    const allMessages = await db.select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt));

    // Prepare messages for AI
    const aiMessages = allMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Check if Anthropic API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("کلید API Anthropic تنظیم نشده است");
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Call AI to generate response
    const aiResponse = await anthropic.messages.create({
      model: process.env.AI_MODEL || "claude-3-haiku-20240307",
      max_tokens: 1024,
      temperature: 0.7,
      system: "شما یک دستیار روان‌شناسی به نام آراما هستید. فارسی صحبت می‌کنید و به کاربران در حل مشکلات روانی و احساسی کمک می‌کنید. صمیمی اما حرفه‌ای باشید.",
      messages: aiMessages as any, // Type assertion due to compatibility
    });

    // Create AI response message
    const aiMessageResult = await db.insert(messages).values({
      id: crypto.randomUUID(),
      conversationId: id,
      content: aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : "نمی توانم این پیام را پردازش کنم.",
      role: "assistant",
    }).returning();

    // Update conversation last message timestamp
    await db.update(conversations)
      .set({ updatedAt: new Date() }) // Changed from lastMessageAt to updatedAt
      .where(eq(conversations.id, id));

    return NextResponse.json({
      userMessage: userMessageResult[0],
      aiMessage: aiMessageResult[0],
    });
  } catch (error) {
    console.error("ارسال پیام انجام نشد:", error);
    return NextResponse.json(
      { 
        error: "ارسال پیام انجام نشد", 
        details: error instanceof Error ? {
          message: error.message,
          name: error.name
        } : "خطای ناشناخته رخ داده است"
      },
      { status: 500 },
    );
  }
}