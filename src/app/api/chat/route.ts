import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { checkChatRateLimit, requireUser } from "@/lib/auth-helpers";

const fallbackAnswer =
  "می‌شنومَت. همین که این احساس را با من در میان گذاشتی، یک قدم مهم است. اگر موافقی، با هم آن را به بخش‌های کوچک‌تر تقسیم کنیم؛ الان کدام قسمت بیشتر از همه فشار می‌آورد؟";

async function anthropicAnswer(text: string, history: Array<{ role: string; content: string }>) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      accept: "text/event-stream",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest",
      max_tokens: 500,
      stream: true,
      system: "تو آراما هستی؛ یک همراه همدل فارسی‌زبان. تشخیص پزشکی نده، وعدهٔ درمان نده، کوتاه و انسانی پاسخ بده و در بحران کاربر را به اورژانس اجتماعی ۱۲۳ ارجاع بده.",
      messages: [...history.slice(-8), { role: "user", content: text }],
    }),
  });
  if (!response.ok || !response.body) throw new Error("AI provider failed");
  return response.body;
}

export async function POST(request: NextRequest) {
  // Authenticate
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;

  // Rate limit
  const rateLimit = checkChatRateLimit(user.userId);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: rateLimit.error }, { status: 429 });
  }

  let body: { text?: string; conversationId?: string };
  try {
    body = (await request.json()) as { text?: string; conversationId?: string };
  } catch {
    return NextResponse.json({ error: "پیام قابل خواندن نیست." }, { status: 400 });
  }
  const text = body.text?.trim();
  if (!text) return NextResponse.json({ error: "پیامت خالی است." }, { status: 400 });

  let conversationId = body.conversationId;
  try {
    if (!conversationId) {
      const [conversation] = await db
        .insert(conversations)
        .values({ userId: user.userId, title: text.slice(0, 48) })
        .returning({ id: conversations.id });
      conversationId = conversation?.id;
    } else {
      // Verify the conversation belongs to this user
      const [conv] = await db
        .select({ id: conversations.id })
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);
      if (!conv) {
        return NextResponse.json({ error: "گفتگو یافت نشد." }, { status: 404 });
      }
    }
    if (!conversationId) throw new Error("Conversation could not be created");
    await db.insert(messages).values({ conversationId, role: "user", content: text });
  } catch {
    return NextResponse.json({ error: "گفتگو ذخیره نشد؛ دوباره امتحان کن." }, { status: 503 });
  }

  let history: Array<{ role: string; content: string }> = [];
  try {
    history = await db
      .select({ role: messages.role, content: messages.content })
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));
  } catch {
    // The user message is already persisted; the response can still stream.
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let complete = "";
      const emit = (event: Record<string, string>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        const providerStream = await anthropicAnswer(text, history);
        if (providerStream) {
          const reader = providerStream.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split("\n\n");
            buffer = events.pop() ?? "";
            for (const event of events) {
              const line = event.split("\n").find((part) => part.startsWith("data: "));
              if (!line) continue;
              try {
                const payload = JSON.parse(line.slice(6)) as { type?: string; delta?: { type?: string; text?: string } };
                const chunk = payload.delta?.type === "text_delta" ? payload.delta.text ?? "" : "";
                if (chunk) {
                  complete += chunk;
                  emit({ type: "delta", text: chunk });
                }
              } catch {
                // Ignore provider keep-alive fragments.
              }
            }
          }
        } else {
          const chunks = fallbackAnswer.match(/.{1,18}/gu) ?? [fallbackAnswer];
          for (const chunk of chunks) {
            complete += chunk;
            emit({ type: "delta", text: chunk });
            await new Promise((resolve) => setTimeout(resolve, 55));
          }
        }
        if (complete) await db.insert(messages).values({ conversationId: conversationId!, role: "assistant", content: complete });
        emit({ type: "done", conversationId: conversationId! });
      } catch {
        emit({ type: "error", message: "آراما نتوانست پاسخ را کامل کند. اتصال را بررسی کن و دوباره تلاش کن." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-conversation-id": conversationId,
    },
  });
}
