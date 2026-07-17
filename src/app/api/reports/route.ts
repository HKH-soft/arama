import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { exerciseCompletions, moodEntries } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";

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
        exerciseStreak: computeStreak(completions.map((c) => c.completedAt)),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "گزارش هفتگی فعلاً آماده نیست." },
      { status: 503 },
    );
  }
}
