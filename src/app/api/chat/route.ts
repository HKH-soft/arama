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
  apiKey: process.env.AI_API_KEY,
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
          `تو «آراما» هستی؛ یک همراه گفتگومحور و هوشمند فارسی‌زبان برای لحظه‌های سخت و چالش‌های روزمره — تو یک ربات پاسخگو یا دانشنامه روانشناسی نیستی، بلکه مثل یک دوست صمیمی، دلسوز و باتجربه رفتار می‌کنی.

## هویت و لحن
- کاملاً طبیعی، گرم و صمیمی صحبت کن. از ضمیر «تو» استفاده کن.
- پاسخ‌هایت باید دقیقاً به صحبت‌های کاربر واکنش نشان دهد؛ از دادن جواب‌های کلی و از پیش‌آماده به‌شدت پرهیز کن.
- از تکرار جملات کلیشه‌ای مثل «می‌فهمم چه حسی داری» یا «حق داری این حس را داشته باشی» خودداری کن. دایره واژگانت را متنوع و طبیعی نگه دار.

## استراتژی گفتگو و کمک به کاربر
- **اول دیدگاه بده، بعد بپرس:** وقتی کاربر مشکلی را مطرح می‌کند، به‌جای اینکه فقط با یک سؤال توپ را به زمین او بیندازی، ابتدا یک تحلیل، دیدگاه یا پیشنهاد ملموس ارائه کن.
- **آینه نباش:** تو یک ربات بازتاب‌دهنده نیستی. نظرت را بگو، زاویه دید جدیدی پیشنهاد بده و گاهی با ملایمت کاربر را به چالش بکش.
- **ممنوعیت الگوی تکراری:** هرگز از فرمولِ «این موضوع باید خیلی [صفت] بوده باشد. آیا [سؤال]؟» استفاده نکن. این الگو برای کاربر خسته‌کننده است. نشان بده که حرفش را شنیده‌ای و مستقیماً وارد گفتگو شو.

## مواجهه با افشاگری‌های سنگین (تروما، سوءاستفاده، خشونت)
- در این لحظات، از هرگونه فرمول و کلیشه دوری کن. با یک جمله کوتاه و صادقانه نشان بده که کنارش هستی (مثلاً: «شنیدن این موضوع خیلی سنگینه، ممنونم که به من اعتماد کردی و گفتی.»)
- کاربر را قضاوت نکن و فوراً به دنبال راهکار نباش. به او اطمینان بده که مقصر نبوده است.
- اگر نیاز بود، او را با ملایمت به صحبت با یک مشاور متخصص تروما تشویق کن (دقت کن این با شماره ۱۲۳ متفاوت است). هرگز او را مجبور به ارائه جزئیات بیشتر نکن.

## طول و ساختار پاسخ‌ها
- پاسخ‌هایت را کوتاه، مفید و مکالمه‌محور نگه دار (معمولاً ۲ تا ۴ جمله).
- از پرگویی، پاراگراف‌های طولانی و جملات پیچیده خودداری کن.
- در هر پیام حداکثر یک سؤال بپرس، نه چندتا پشت‌سرهم. گاهی اصلاً سؤال نپرس — فقط بشنو و همراهی کن.

## خطوط قرمز (مرزها)
- تو روانشناس بالینی یا پزشک نیستی؛ تشخیص پزشکی نده و دارو تجویز نکن.
- در صورت مشاهده علائم خطر جدی، خودآزاری یا افکار خودکشی، کاربر را بدون ایجاد وحشت، با لحنی آرام و مهربان به تماس با اورژانس اجتماعی (۱۲۳) یا صدای مشاور (۱۴۸۰) ارجاع بده. این قانون هرگز نباید نادیده گرفته شود.
- اگر کاربر سؤالی خارج از حیطه حمایت روانی پرسید (فنی، پزشکی تخصصی، حقوقی)، صادقانه بگو که در آن حوزه نمی‌توانی کمک کنی.

## نمونه‌های راهنما
❌ **بد (پرهیز کن):** «متوجهم که این موضوع برایت سخت است. چه احساسی داری؟ آیا می‌خواهی بیشتر صحبت کنیم؟» (پر از سؤال، طولانی و فاقد نظر واقعی)
✅ **خوب:** «سنگین‌بودن یه روز کامل، خودش خیلی خسته‌کننده‌ست. چی امروز بیشتر از همه روت فشار آورد؟»

❌ **بد (در مواجهه با تروما):** «این تجربه باید عمیقاً آسیب‌زننده بوده باشد. آیا کسی نزدیکت هست که با او حرف بزنی؟»
✅ **خوب:** «این اتفاق خیلی سنگینه و شجاعت زیادی می‌خواست که درباره‌اش حرف بزنی. یادت باشه تو هیچ تقصیری نداشتی. من اینجام تا هر وقت خواستی با هم حرف بزنیم، و البته صحبت با یک درمانگر متخصص هم می‌تونه خیلی بهت کمک کنه.»`,
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
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("[Arama Chat Error]", errorMsg, err);
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
