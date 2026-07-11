import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { conversations, messages } from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc } from "drizzle-orm"; // Import Drizzle operators
import Anthropic from "@anthropic-ai/sdk";
import { checkUserRateLimit } from "@/lib/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { content } = await request.json();

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "محتوا نمی‌تواند خالی باشد" },
        { status: 400 },
      );
    }

    // Rate limit: 20 messages per minute per user (AI calls are expensive)
    const rateLimit = checkUserRateLimit(user.id, 20, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً چند لحظه صبر کنید.",
        },
        { status: 429 },
      );
    }

    // Check if conversation exists and belongs to user
    const conversationResult = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, user.id)));

    if (conversationResult.length === 0) {
      return NextResponse.json(
        { error: "مکالمه یافت نشد یا متعلق به شما نیست" },
        { status: 404 },
      );
    }

    // Create user message
    const userMessageResult = await db
      .insert(messages)
      .values({
        id: crypto.randomUUID(),
        conversationId: id,
        content: content.trim(),
        role: "user",
      })
      .returning();

    // Get all messages in the conversation for context
    const allMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt));

    // Prepare messages for AI
    const aiMessages = allMessages.map((msg) => ({
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
      baseURL: process.env?.ANTHROPIC_API_BASE_URL,
    });

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false; // Track if controller is already closed

        const closeController = () => {
          if (!isClosed) {
            isClosed = true;
            controller.close();
          }
        };

        try {
          // Call AI to generate response with streaming
          const aiResponse = await anthropic.messages.stream({
            model: process.env.AI_MODEL || "claude-3-haiku-20240307",
            max_tokens: 1024,
            temperature: 0.7,
            system:
              "شما یک دستیار روان‌شناسی به نام آراما هستید. فارسی صحبت می‌کنید و به کاربران در حل مشکلات روانی و احساسی کمک می‌کنید. صمیمی اما حرفه‌ای باشید.",
            messages: aiMessages as any, // Type assertion due to compatibility
          });

          let fullResponse = "";

          // Subscribe to the stream and handle events
          aiResponse.on("text", (textDelta) => {
            fullResponse += textDelta;
            // Send incremental update to client in SSE format
            const sseMessage = `data: ${JSON.stringify({ content: textDelta })}\n\n`;
            if (!isClosed) {
              controller.enqueue(new TextEncoder().encode(sseMessage));
            }
          });

          aiResponse.on("end", async () => {
            try {
              // Get the final message
              const result = await aiResponse.finalMessage();

              // Create AI response message in database after streaming completes
              const aiMessageResult = await db
                .insert(messages)
                .values({
                  id: crypto.randomUUID(),
                  conversationId: id,
                  content:
                    result.content[0].type === "text"
                      ? result.content[0].text
                      : "نمی توانم این پیام را پردازش کنم.",
                  role: "assistant",
                })
                .returning();

              // Update conversation last message timestamp
              await db
                .update(conversations)
                .set({ updatedAt: new Date() })
                .where(eq(conversations.id, id));

              // Send completion signal
              if (!isClosed) {
                const doneMessage = `data: ${JSON.stringify({ done: true })}\n\n`;
                controller.enqueue(new TextEncoder().encode(doneMessage));
              }
            } catch (dbError) {
              console.error("Database error after streaming:", dbError);
              if (!isClosed) {
                const errorMessage = `data: ${JSON.stringify({ error: "خطا در ذخیره پیام" })}\n\n`;
                controller.enqueue(new TextEncoder().encode(errorMessage));
              }
            } finally {
              closeController();
            }
          });

          aiResponse.on("error", (error) => {
            console.error("AI streaming error:", error);
            if (!isClosed) {
              const errorMessage = `data: ${JSON.stringify({ error: "خطا در دریافت پاسخ از هوش مصنوعی" })}\n\n`;
              controller.enqueue(new TextEncoder().encode(errorMessage));
            }
            closeController();
          });
        } catch (error) {
          console.error("AI streaming error:", error);
          if (!isClosed) {
            const errorMessage = `data: ${JSON.stringify({ error: "خطا در دریافت پاسخ از هوش مصنوعی" })}\n\n`;
            controller.enqueue(new TextEncoder().encode(errorMessage));
          }
          closeController();
        }
      },
    });

    // Return the streaming response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("ارسال پیام انجام نشد:", error);
    return NextResponse.json(
      { error: "ارسال پیام انجام نشد" },
      { status: 500 },
    );
  }
}
