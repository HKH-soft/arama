import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { moodEntries } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";

const labels = ["سخت", "کسل", "معمولی", "خوب", "عالی"];

export async function GET(request: NextRequest) {
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;
  try {
    const rows = await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, user.userId))
      .orderBy(asc(moodEntries.checkedInAt));
    return NextResponse.json({
      entries: rows.map((row) => ({
        id: row.id,
        mood: row.mood,
        label: row.label,
        note: row.note,
        checkedInAt: row.checkedInAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "تاریخچهٔ خلق‌وخو فعلاً در دسترس نیست." },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;
  try {
    const body = (await request.json()) as { mood?: number; note?: string };
    const mood = Number(body.mood);
    if (!Number.isFinite(mood) || mood < 1 || mood > 10) {
      return NextResponse.json(
        { error: "یک حس معتبر انتخاب کن." },
        { status: 400 },
      );
    }
    const [entry] = await db
      .insert(moodEntries)
      .values({
        userId: user.userId,
        mood: Math.round(mood),
        label:
          labels[
            Math.min(
              labels.length - 1,
              Math.max(0, Math.round(mood / 2) - 1),
            )
          ],
        note: body.note?.trim() || null,
      })
      .returning();
    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "ثبت حال امروز انجام نشد؛ دوباره امتحان کن." },
      { status: 500 },
    );
  }
}
