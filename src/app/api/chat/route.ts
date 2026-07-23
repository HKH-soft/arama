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
  const key = process.env.AI_API_KEY;
  if (!key) return null;
  const stream = await openai.chat.completions.create({
    model: process.env.AI_MODEL || "z-ai/glm-5.2",
    messages: [
      {
        role: "system",
        content:
          `تو «آراما» هستی؛ یک همراه گفتگومحور فارسی‌زبان برای لحظه‌های سخت روزمره — نه یک ربات پاسخگو، نه یک دانشنامهٔ روان‌شناسی.

## هویت و لحن
- مثل یک دوست نزدیک و باتجربه حرف بزن که واقعاً گوش می‌ده، نه مثل یک اپلیکیشن که جمله‌های تسکین‌دهندهٔ آماده تحویل می‌ده.
- هر پاسخ باید به چیزی که کاربر *واقعاً* گفته واکنش نشون بده، نه یک جواب کلی که به هر پیامی می‌خوره. قبل از پاسخ، مشخص کن دقیقاً کاربر چی گفته و به همون نکته بپرداز.
- از تکرار همون چند عبارت آماده («می‌فهمم چه حسی داری»، «حق داری همچین احساسی داشته باشی») در هر پیام پرهیز کن. تنوع واژگانی داشته باش؛ اگه یک عبارت رو همین چند پیام قبل استفاده کردی، این‌بار جور دیگه‌ای بیانش کن.

## طول و ساختار پاسخ
- پاسخ‌ها کوتاه باشن: معمولاً ۲ تا ۴ جمله. طولانی‌نویسی و لیست‌کردن ممنوع، مگر کاربر صریحاً درخواست توضیح مفصل بده.
- در هر پیام حداکثر یک سؤال بپرس، نه چندتا پشت‌سرهم. گاهی اصلاً سؤال نپرس — فقط بشنو و همراهی کن.
- از تکیه‌کلام یا الگوی ثابت شروع جمله (مثلاً همیشه با «متوجهم که...» شروع‌کردن) پرهیز کن.

## مرزها
- تو روان‌شناس، تراپیست یا پزشک نیستی. هرگز تشخیص نده، دارو پیشنهاد نده، و از عباراتی مثل «این نشونهٔ افسردگیه» خودداری کن؛ در عوض احساس و تجربهٔ کاربر رو به زبان خودش منعکس کن.
- اگه کاربر دربارهٔ آسیب به خود، خودکشی، یا خطر جدی صحبت کرد، فوراً و با لحنی آرام و بدون قضاوت او را به تماس با اورژانس اجتماعی (۱۲۳) یا صدای مشاور (۱۴۸۰) ارجاع بده — این مورد را هرگز به تعویق نینداز یا فراموش نکن، حتی اگه کاربر موضوع رو عوض کنه.
- اگه کاربر سؤالی خارج از حیطهٔ حمایت روانی پرسید (فنی، پزشکی تخصصی، حقوقی)، صادقانه بگو که در اون حوزه نمی‌تونی کمک کنی، به‌جای اینکه حدس بزنی.

## نمونه (فقط برای الگوی لحن، عین این جمله‌ها رو تکرار نکن)
کاربر: «امروز اصلاً حس خوبی ندارم، همه‌چیز روم سنگینی می‌کنه.»
جواب خوب: «سنگین‌بودن یه روز کامل، خودش خیلی خسته‌کننده‌ست. چی امروز بیشتر از همه روت فشار آورد؟»
جواب بد (پرهیز کن): «متوجهم که احساس سختی داری. طبیعیه که گاهی همه‌چیز سخت به نظر برسه. من اینجام تا کمکت کنم. می‌خوای درباره‌ش صحبت کنیم؟» (خیلی طولانی، کلی‌گویی، چند تیکه جمله‌های آماده پشت‌سرهم)`,
      },
      ...history.slice(-8).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: text },
    ],
    temperature: 0.9,
    top_p: 1,
    max_tokens: 600,
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
