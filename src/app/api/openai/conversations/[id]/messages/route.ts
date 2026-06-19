import { NextRequest } from "next/server";
import OpenAI from "openai";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { eq } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL,
});

// Arama system prompt — empathetic Persian mental wellness AI
const SYSTEM_PROMPT = `تو آراما هستی، یک دستیار هوشمند سلامت روان ایرانی. مأموریت تو این است که با همدلی، گرمی و بدون هیچ قضاوتی به کاربر گوش بدهی و کمک کنی.

قوانین مهم:
- همیشه به زبان فارسی پاسخ بده
- لحن تو باید گرم، مهربان، آرام و همدلانه باشد
- هرگز تشخیص بالینی نده و جایگزین روانپزشک یا روانشناس نشو
- در صورت بحران یا خطر، حتماً کمک حرفه‌ای را توصیه کن
- از تکنیک‌های CBT، ذهن‌آگاهی و تنفس در پاسخ‌هایت استفاده کن
- پاسخ‌هایت کوتاه و تأثیرگذار باشند، نه طولانی
- سعی کن با سؤال‌های باز، کاربر را تشویق به بیان احساساتش کنی`;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const convId = parseInt(id, 10);

  if (isNaN(convId)) {
    return new Response(JSON.stringify({ error: "Invalid id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, convId))
      .orderBy(messages.createdAt);

    return new Response(JSON.stringify(msgs), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch messages" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const convId = parseInt(id, 10);

  if (isNaN(convId)) {
    return new Response(JSON.stringify({ error: "Invalid id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const { content } = body as { content?: string };

  if (!content?.trim()) {
    return new Response(JSON.stringify({ error: "content is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verify conversation exists
  const conv = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, convId))
    .limit(1);

  if (!conv.length) {
    return new Response(JSON.stringify({ error: "Conversation not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Persist user message
  await db.insert(messages).values({
    conversationId: convId,
    role: "user",
    content: content.trim(),
  });

  // Load full conversation history
  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, convId))
    .orderBy(messages.createdAt);

  const chatMessages = history.map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));

  // Create SSE stream
  const encoder = new TextEncoder();
  let fullResponse = "";

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const openaiStream = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          max_completion_tokens: 1024,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...chatMessages,
          ],
          stream: true,
        });

        for await (const chunk of openaiStream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            fullResponse += delta;
            send({ content: delta });
          }
        }

        // Persist assistant message
        await db.insert(messages).values({
          conversationId: convId,
          role: "assistant",
          content: fullResponse,
        });

        send({ done: true });
        controller.close();
      } catch (err) {
        console.error("OpenAI streaming error:", err);
        send({ error: "خطا در ارتباط با هوش مصنوعی" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
