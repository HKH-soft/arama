import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/db";
import { voiceJournals, moodEntries } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";

export const maxDuration = 60; // Set Vercel execution limit if deployed

const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL || "https://api.openai.com/v1",
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-to-prevent-crash",
});

export async function POST(request: NextRequest) {
  let userResult = requireUser(request);
  let userId = "temp-guest-user";
  if (!(userResult instanceof NextResponse)) {
    userId = userResult.userId;
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const duration = parseInt(formData.get("duration") as string || "0", 10);

    if (!audioFile) {
      return NextResponse.json({ error: "فایل صوتی یافت نشد." }, { status: 400 });
    }

    // 1. Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "fa",
    });

    const transcriptText = transcription.text.trim();
    if (!transcriptText) {
      return NextResponse.json({ error: "صدایی تشخیص داده نشد. لطفاً دوباره تلاش کن." }, { status: 400 });
    }

    // 2. Get AI Insight and Mood Label
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `تو آراما هستی؛ یک همراه همدل فارسی‌زبان.
کاربر فایل صوتی از روزش ضبط کرده و این متن پیاده‌سازی شده‌ی آن است.
لطفاً یک پاسخ خیلی کوتاه، گرم و غیرقضاوتی در ۱ یا ۲ جمله بده.
همچنین احساس غالب کاربر را در قالب یک کلمه (مثل آرام، مضطرب، خسته، شاد) و یک نمره از ۱ تا ۵ (۱=خیلی بد، ۵=خیلی خوب) در قالب JSON برگردان.

فرمت پاسخ حتماً باید JSON معتبر باشد:
{
  "insight": "پاسخ همدلانه شما",
  "moodLabel": "کلمه احساس",
  "moodScore": 3
}`
        },
        { role: "user", content: transcriptText }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const aiContent = completion.choices[0]?.message.content;
    if (!aiContent) throw new Error("AI response empty");
    
    let parsed: { insight: string; moodLabel: string; moodScore: number };
    try {
      parsed = JSON.parse(aiContent);
    } catch {
      parsed = { insight: "می‌شنومَت. ممنون که احساست را با من در میان گذاشتی.", moodLabel: "نامشخص", moodScore: 3 };
    }

    // 3. Save to database
    // Save voice journal
    try {
      await db.insert(voiceJournals).values({
        userId,
        transcript: transcriptText,
        aiInsight: parsed.insight,
        moodLabel: parsed.moodLabel,
        durationSeconds: duration,
      });

      // Save mood entry as a real check-in
      await db.insert(moodEntries).values({
        userId,
        mood: parsed.moodScore,
        label: parsed.moodLabel,
        note: "ثبت از طریق صدای روز",
      });
    } catch (dbError) {
      console.warn("Could not save to DB (database might be down), but returning AI insight.", dbError);
    }

    return NextResponse.json({
      transcript: transcriptText,
      insight: parsed.insight,
      moodLabel: parsed.moodLabel,
    });

  } catch (error) {
    console.error("[VoiceJournal]", error);
    return NextResponse.json({ error: "خطایی در پردازش صدای شما رخ داد." }, { status: 500 });
  }
}
