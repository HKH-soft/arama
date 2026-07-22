import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { exerciseCompletions, moodEntries, profiles } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL || "https://api.openai.com/v1",
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-to-prevent-crash",
});

/** Count consecutive days (ending today or yesterday) that have >=1 completion. */
function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  const dayKey = (d: Date) => {
    const local = new Date(d);
    return `${local.getFullYear()}-${local.getMonth()}-${local.getDate()}`;
  };
  const days = new Set(dates.map(dayKey));
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // Streak only counts if it reaches today or yesterday.
  const cursor = new Date();
  if (!days.has(dayKey(today)) && !days.has(dayKey(yesterday))) return 0;
  if (!days.has(dayKey(today))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function GET(request: NextRequest) {
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;
  try {
    const rows = await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, user.userId))
      .orderBy(asc(moodEntries.checkedInAt));

    const completions = await db
      .select({ completedAt: exerciseCompletions.completedAt })
      .from(exerciseCompletions)
      .where(eq(exerciseCompletions.userId, user.userId))
      .orderBy(asc(exerciseCompletions.completedAt));

    const average = rows.length
      ? rows.reduce((sum, row) => sum + row.mood, 0) / rows.length
      : 0;
    const best = rows.length ? Math.max(...rows.map((row) => row.mood)) : 0;
    const latest = rows.at(-1);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const completionsThisWeek = completions.filter(
      (c) => c.completedAt >= weekAgo,
    ).length;
    const exerciseStreak = computeStreak(completions.map((c) => c.completedAt));

    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.userId)).limit(1);
    const userName = profile?.name || "دوست من";

    let aiInsight = "";
    if (rows.length > 0 || completionsThisWeek > 0) {
      try {
        const prompt = `شما تراپیست همدل آراما هستید.
نام کاربر: ${userName}
آمار این هفته او:
- تعداد ثبت خلق‌‌وخو: ${rows.length} بار
- میانگین خلق (از ۱۰): ${Number(average.toFixed(1))}
- بهترین خلق ثبت‌شده: ${best}
- تمرین‌های کامل‌شده در این هفته: ${completionsThisWeek} تمرین
- زنجیره متوالی تمرین: ${exerciseStreak} روز

لطفاً یک یادداشت کوتاه، بسیار صمیمی و همدلانه (حدود ۳ تا ۴ جمله) برای گزارش هفتگی او بنویس.
- مستقیماً با خود او (دوم شخص) صحبت کن و نامش را بیاور.
- اگر حالش در طول هفته پایین بوده، به او بگو که داشتن روزهای سخت طبیعی است و همین که به خودش توجه کرده ارزشمند است.
- اگر تمرین‌ها را پیوسته انجام داده، او را تشویق کن و از تلاشش قدردانی کن.
- اگر ثبت کمی داشته، بدون قضاوت به او یادآوری کن که هر زمان برگردد آراما اینجاست.
- لحنت باید گرم، حمایت‌گر و شبیه به یک دوست و روانشناس باشد.

خروجی حتماً یک آبجکت JSON معتبر باشد:
{
  "insight": "یادداشت همدلانه شما"
}`;

        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [{ role: "system", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        const aiContent = completion.choices[0]?.message.content;
        if (aiContent) {
          aiInsight = JSON.parse(aiContent).insight;
        }
      } catch (err) {
        console.error("[Reports API AI Error]", err);
        // Fallback if AI fails
        aiInsight = completions.length > 0 
          ? `تا امروز ${completions.length} تمرین را کامل کرده‌ای. هر کدام یک قدم رو به جلو بوده — همین پیوستگی است که تفاوت می‌سازد.` 
          : "رشد همیشه شبیه بالا رفتن نیست. همین که به خودت سر می‌زنی، خودش مراقبت است.";
      }
    } else {
      aiInsight = "رشد همیشه شبیه بالا رفتن نیست. همین که به خودت سر می‌زنی، خودش مراقبت است.";
    }

    return NextResponse.json({
      report: {
        checkIns: rows.length,
        average: Number(average.toFixed(1)),
        best,
        latestLabel: latest?.label ?? null,
        trend: rows.length > 1 ? rows.at(-1)!.mood - rows[0].mood : 0,
        entries: rows.map((row) => ({
          mood: row.mood,
          label: row.label,
          checkedInAt: row.checkedInAt.toISOString(),
        })),
        exercisesCompleted: completions.length,
        exercisesThisWeek: completionsThisWeek,
        exerciseStreak,
        aiInsight,
      },
    });
  } catch (error) {
    console.error("[Reports API Error]", error);
    return NextResponse.json(
      { error: "گزارش هفتگی فعلاً آماده نیست." },
      { status: 503 },
    );
  }
}
