import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { checkChatRateLimit, requireUser } from "@/lib/auth-helpers";
import OpenAI from "openai";

const fallbackAnswer =
  "می‌شنومَت. همین که این احساس را با من در میان گذاشتی، یک قدم مهم است. اگر موافقی، با هم آن را به بخش‌های کوچک‌تر تقسیم کنیم؛ الان کدام قسمت بیشتر از همه فشار می‌آورد؟";

const openai = new OpenAI({
  baseURL: process.env.AI_BASE_URL || "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.AI_API_KEY || "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",
});

async function openaiAnswer(
  text: string,
  history: Array<{ role: string; content: string }>,
) {
  const key = process.env.AI_API_KEY || "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";
  if (!key) return null;
  const stream = await openai.chat.completions.create({
    model: process.env.AI_MODEL || "z-ai/glm-5.2",
    messages: [
      {
        role: "system",
        content:
          `شما "آراما" (Arama) هستید؛ یک دستیار هوشمند، فوق‌العاده همدل، صبور، مهربان و کاملاً بدون قضاوت.
هدف شما ایجاد یک فضای بسیار امن روانی برای کاربر است تا بتواند درباره احساسات، استرس‌ها و روزمرگی‌هایش صحبت کند.

قوانین مهم شخصیت شما:
۱. لحن شما باید بسیار صمیمی، مهربان، درک‌کننده، محاوره‌ای (فارسی روان) و کوتاه باشد. تصور کنید بهترین دوست یا مهربان‌ترین همراه او هستید.
۲. با صبر و حوصلهٔ فراوان صحبت کنید. خشک و ماشینی نباشید. احساسات کاربر را عمیقاً درک کرده و تایید کنید.
۳. شما روان‌شناس یا پزشک نیستید. هرگز تشخیص پزشکی ندهید و دارو تجویز نکنید.
۴. از متون طولانی و کتابی پرهیز کنید. پاسخ‌ها باید کوتاه، قابل هضم، صمیمی و در قالب یک گفتگوی دوطرفه باشند.
۵. اگر کاربر در بحران شدید روحی است (افکار آسیب به خود)، با لحنی دلسوزانه او را به تماس با اورژانس اجتماعی (۱۲۳) یا صدای مشاور (۱۴۸۰) در ایران راهنمایی کنید.
۶. همیشه با گوش دادن فعال شروع کنید، احساس کاربر را تایید کنید، به او نشان دهید که تنها نیست و با صبوری بپرسید که چگونه می‌توانید به او کمک کنید.`,
      },
      ...history.slice(-8).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: text },
    ],
    temperature: 1,
    top_p: 1,
    max_tokens: 16384,
    seed: 42,
    stream: true,
  });
  return stream;
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
    return NextResponse.json(
      { error: "پیام قابل خواندن نیست." },
      { status: 400 },
    );
  }
  const text = body.text?.trim();
  if (!text)
    return NextResponse.json({ error: "پیامت خالی است." }, { status: 400 });

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
        const providerStream = await openaiAnswer(text, history);
        if (providerStream) {
          for await (const chunk of providerStream) {
            const delta = chunk.choices?.[0]?.delta?.content;
            if (delta) {
              complete += delta;
              emit({ type: "delta", text: delta });
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
        if (complete)
          await db.insert(messages).values({
            conversationId: conversationId!,
            role: "assistant",
            content: complete,
          });
        emit({ type: "done", conversationId: conversationId! });
      } catch {
        emit({
          type: "error",
          message:
            "آراما نتوانست پاسخ را کامل کند. اتصال را بررسی کن و دوباره تلاش کن.",
        });
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
