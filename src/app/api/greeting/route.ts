import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/db";
import { moodEntries, profiles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";

const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
const baseURL = process.env.AI_BASE_URL || process.env.OPENAI_API_BASE_URL || "https://api.openai.com/v1";

const openai = apiKey
  ? new OpenAI({
      baseURL,
      apiKey,
    })
  : null;

export async function GET(request: NextRequest) {
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;

  try {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.userId))
      .limit(1);
    const userName = profile?.name || "دوست من";

    const recentMoods = await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, user.userId))
      .orderBy(desc(moodEntries.checkedInAt))
      .limit(3);

    const moodHistory = recentMoods.map((m) => m.label).join("، ");

    // Determine time of day
    const hour = new Date().getHours();
    let timeOfDay = "روز";
    if (hour < 12) timeOfDay = "صبح";
    else if (hour < 17) timeOfDay = "ظهر";
    else if (hour < 20) timeOfDay = "عصر";
    else timeOfDay = "شب";

    const defaultGreeting = {
      text: `${timeOfDay} بخیر ${userName}`,
      insight: "همین که اینجایی و به خودت توجه می‌کنی، ارزشمند است.",
    };

    if (!openai) {
      return NextResponse.json(defaultGreeting);
    }

    const prompt = `تو دستیار همدل آراما هستی.
نام کاربر: ${userName}
زمان فعلی: ${timeOfDay}
احساسات اخیر او (از جدید به قدیم): ${moodHistory || "هنوز احساسی ثبت نکرده"}

لطفاً یک پیام خوش‌آمدگویی بسیار کوتاه (حدود ۲-۳ کلمه مثل "${timeOfDay} بخیر ${userName}") و یک بینش/جملهٔ آرام‌بخش اختصاصی بر اساس احساسات اخیرش (یک خط کوتاه، حداکثر ۶-۷ کلمه) با لحنی صمیمی و دوستانه تولید کن.

خروجی حتماً یک JSON معتبر باشد:
{
  "text": "سلام و احوال‌پرسی",
  "insight": "جمله کوتاه و همدلانه"
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: process.env.AI_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "system", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const aiContent = completion.choices[0]?.message.content;
      if (aiContent) {
        const parsed = JSON.parse(aiContent);
        if (parsed.text && parsed.insight) {
          return NextResponse.json(parsed);
        }
      }
    } catch (aiErr) {
      console.warn("[Greeting API AI fallback]", aiErr);
    }

    return NextResponse.json(defaultGreeting);
  } catch (error) {
    console.error("[Greeting API Error]", error);
    return NextResponse.json({
      text: "سلام دوست من",
      insight: "همراه همیشگی تو برای آرامش و رشد.",
    });
  }
}
