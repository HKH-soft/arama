import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db";
import { moodEntries } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const moods = await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, user.id))
      .orderBy(moodEntries.loggedAt)
      .limit(30);

    return NextResponse.json(moods);
  } catch (err) {
    console.error("Moods fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت وضعیت خلقی" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { mood, mode } = body;

    if (!mood) {
      return NextResponse.json({ error: "مشخصات ناقص است" }, { status: 400 });
    }

    // Determine currentMode: use mode if provided, otherwise default to mood
    const currentMode = mode ?? mood;

    const result = await db
      .insert(moodEntries)
      .values({
        id: `${Date.now()}-${Math.random()}`,
        userId: user.id,
        mood,
        currentMode,
        loggedAt: new Date(),
      })
      .returning();

    return NextResponse.json(result[0]);
  } catch (err) {
    console.error("Mood creation error:", err);
    return NextResponse.json(
      { error: "خطا در ثبت وضعیت خلقی" },
      { status: 500 },
    );
  }
}
