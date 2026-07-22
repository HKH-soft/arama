import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/db";
import { moodEntries, profiles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";

const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL || "https://api.openai.com/v1",
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-to-prevent-crash",
});

export async function GET(request: NextRequest) {
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;

  try {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.userId)).limit(1);
    const userName = profile?.name || "دوست من";

    const recentMoods = await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, user.userId))
      .orderBy(desc(moodEntries.checkedInAt))
      .limit(3);

    const moodHistory = recentMoods.map(m => m.label).join("، ");
    
    // Determine time of day
    const hour = new Date().getHours();
    let timeOfDay = "روز";
    if (hour < 12) timeOfDay = "صبح";
    else if (hour < 17) timeOfDay = "ظهر";
    else if (hour < 20) timeOfDay = "عصر";
    else timeOfDay = "شب";

    const prompt = `تو دستیار همدل آراما هستی.
نام کاربر: ${userName}
زمان فعلی: ${timeOfDay}
احساسات اخیر او (از جدید به قدیم): ${moodHistory || "هنوز احساسی ثبت نکرده"}

لطفاً یک پیام خوش‌آمدگویی بسیار کوتاه (حدود ۲-۳ کلمه مثل "صبح بخیر علی") و یک بینش/جملهٔ آرام‌بخش اختصاصی بر اساس احساسات اخیرش (یک خط کوتاه، حداکثر ۶-۷ کلمه) با لحنی صمیمی و دوستانه تولید کن.

خروجی حتماً یک JSON معتبر باشد:
{
  "text": "سلام و احوال‌پرسی (مثلا: عصر بخیر مریم)",
  "insight": "جمله کوتاه و همدلانه"
}`;

    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const aiContent = completion.choices[0]?.message.content;
    if (!aiContent) throw new Error("Empty response");

    const parsed = JSON.parse(aiContent);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[Greeting API]", error);
    return NextResponse.json(
      { error: "مشکلی در تولید پیام پیش آمد" },
      { status: 500 }
    );
  }
}
