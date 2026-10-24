import { and, asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { checkChatRateLimit, requireUser } from "@/lib/auth-helpers";
import { generateClinicalResponse } from "@/lib/clinical-ai";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

function getOpenAIClient() {
  const key = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({
    baseURL:
      process.env.AI_BASE_URL ||
      process.env.OPENAI_API_BASE_URL ||
      "https://integrate.api.nvidia.com/v1",
    apiKey: key,
  });
}

async function openaiAnswer(
  text: string,
  history: Array<{ role: string; content: string }>,
) {
  const client = getOpenAIClient();
  if (!client) return null;

  try {
    const completionPromise = client.chat.completions.create({
      model: process.env.AI_MODEL || "z-ai/glm-5.2",
      messages: [
        {
          role: "system",
          content:
            `تو «آراما» هستی؛ یک همراه هوشمند، صمیمی، دلسوز و حرفه‌ای سلامت روان برای فارسی‌زبانان. تو یک ربات پاسخگو یا دانشنامه نیستی؛ بلکه حضوری آرامش‌بخش، شنوا، متمرکز و آگاه داری — درست مانند یک دوست بسیار دانا و درمانگری مهربان و بدون قضاوت.

## اصول کلیدی و روان‌شناختی رفتار
۱. **همدلی عمیق و اصیل (Active Empathic Listening):**
   - احساس کاربر را اعتبارسنجی کن، اما از کلمات کلیشه‌ای («متوجهم»، «حق داری») استفاده نکن. نشان بده که جزئیات حرفش را شنیده‌ای.
   - از ضمیر صمیمی «تو» استفاده کن. لحنی نرم، صبور، پذیرنده و گرم داشته باش.

۲. **رویکرد درمانی CBT و ذهن‌آگاهی (Mindfulness):**
   - وقتی کاربر درگیر نشخوار فکری، فاجعه‌سازی یا خودسرزنشی است، با پرسش‌های ملایم سقراطی یا بازتاب آرام، زاویهٔ دید تازه‌ای به او هدیه بده.
   - در لحظات اضطراب شدید یا تپش قلب، بلافاصله کاربر را زمین‌گیر (Grounding) کن: تکنیک تنفس ۴-۷-۸ یا اتصال به حواس پنج‌گانه (پاهایت را روی زمین حس کن، دستت را روی سینه‌ات بگذار).

۳. **پرهیز از نسخه‌پیچی شتاب‌زده:**
   - بلافاصله نصیحت نکن یا فهرست چندمرحله‌ای نده. اول به کاربر احساس امنیت و دیده شدن بده؛ سپس گام‌های بسیار کوچک، ملموس و قابل‌انجام پیشنهاد کن.

۴. **مواجهه با لحظات سخت و بحران روانی:**
   - هرگز مکالمه را با یک پیام ماشینی ارجاع به خطوط بحران قطع نکن. در کنار کاربر بمان، با مهربانی دستش را بگیر و فضای امنی برای تخلیه هیجاناتش بساز. به او یادآوری کن که تنها نیست و این طوفان هم می‌گذرد.

۵. **ساختار پاسخ‌ها:**
   - پاسخ‌هایت روان، کوتاه، خوانا و گفتگو‌محور باشد (معمولاً ۲ تا ۴ جملهٔ پرمعنا).
   - در هر پیام بیش از یک سؤال نپرس تا کاربر دچار سردرگمی نشود. گاهی فقط بشنو و همدردی کن بدون اینکه هیچ سؤالی بپرسی.`,
        },
        ...history.slice(-8).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user", content: text },
      ],
      temperature: 0.85,
      top_p: 1,
      max_tokens: 700,
      stream: true,
    });

    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("AI Provider Timeout")), 12000),
    );

    return (await Promise.race([completionPromise, timeoutPromise])) as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
  } catch (apiErr) {
    console.warn("[Arama Chat] AI upstream error or timeout, switching to clinical engine:", apiErr);
    return null;
  }
}

export async function POST(request: NextRequest) {
  // Authenticate
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;

  // Rate limit
  const rateLimit = await checkChatRateLimit(user.userId);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: rateLimit.error }, { status: 429 });
  }

  let body: { text?: string; conversationId?: string };
  try {
    body = (await request.json()) as { text?: string; conversationId?: string };
  } catch {
    return NextResponse.json(
      { error: "پیام قابل خواندن نیست." },
      { status: 400 },
    );
  }
  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "پیامت خالی است." }, { status: 400 });
  }

  // Prevent memory and token flooding attacks
  if (text.length > 2000) {
    return NextResponse.json(
      { error: "طول پیام بیش از حد مجاز است (حداکثر ۲۰۰۰ نویسه)." },
      { status: 400 },
    );
  }

  let conversationId = body.conversationId?.trim();
  if (conversationId && conversationId.length > 100) {
    return NextResponse.json(
      { error: "شناسه گفتگو نامعتبر است." },
      { status: 400 },
    );
  }
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
        .where(
          and(
            eq(conversations.id, conversationId),
            eq(conversations.userId, user.userId),
          ),
        )
        .limit(1);
      if (!conv) {
        return NextResponse.json({ error: "گفتگو یافت نشد." }, { status: 404 });
      }
    }
    if (!conversationId) throw new Error("Conversation could not be created");
    await db
      .insert(messages)
      .values({ conversationId, role: "user", content: text });
  } catch {
    return NextResponse.json(
      { error: "گفتگو ذخیره نشد؛ دوباره امتحان کن." },
      { status: 503 },
    );
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
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        );
      };

      try {
        let streamWorked = false;
        try {
          const providerStream = await openaiAnswer(text, history);
          if (providerStream) {
            for await (const chunk of providerStream) {
              const delta = chunk.choices?.[0]?.delta?.content;
              if (delta) {
                complete += delta;
                emit({ type: "delta", text: delta });
                streamWorked = true;
              }
            }
          }
        } catch (streamErr) {
          console.warn("[Arama Chat] Stream iteration failed, falling back to clinical engine:", streamErr);
        }

        // If upstream AI provider was unavailable or empty, engage the clinical engine
        if (!streamWorked || !complete.trim()) {
          const clinicalAnswer = generateClinicalResponse(text, history);
          const chunks = clinicalAnswer.match(/.{1,16}/gu) ?? [clinicalAnswer];
          for (const chunk of chunks) {
            complete += chunk;
            emit({ type: "delta", text: chunk });
            await new Promise((resolve) => setTimeout(resolve, 30));
          }
        }

        if (complete) {
          try {
            await db.insert(messages).values({
              conversationId: conversationId!,
              role: "assistant",
              content: complete,
            });
          } catch (dbErr) {
            console.error("[Arama Chat DB Error] Failed to save assistant message", dbErr);
          }
        }
        emit({ type: "done", conversationId: conversationId! });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("[Arama Chat Error]", errorMsg, err);
        const fallback = generateClinicalResponse(text, history);
        emit({ type: "delta", text: fallback });
        emit({ type: "done", conversationId: conversationId! });
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
