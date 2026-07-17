import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { exerciseCompletions, exercises } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;
  try {
    const rows = await db
      .select()
      .from(exerciseCompletions)
      .where(eq(exerciseCompletions.userId, user.userId))
      .orderBy(exerciseCompletions.completedAt);
    return NextResponse.json({ completions: rows });
  } catch {
    return NextResponse.json(
      { error: "تاریخچهٔ تمرین‌ها بارگذاری نشد." },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;
  try {
    const body = (await request.json()) as {
      exerciseId: string;
      durationSeconds: number;
    };
    if (!body.exerciseId || !body.durationSeconds) {
      return NextResponse.json(
        { error: "اطلاعات تمرین کامل نیست." },
        { status: 400 },
      );
    }
    const [exercise] = await db
      .select({ id: exercises.id })
      .from(exercises)
      .where(eq(exercises.id, body.exerciseId))
      .limit(1);
    if (!exercise) {
      return NextResponse.json(
        { error: "تمرین یافت نشد." },
        { status: 404 },
      );
    }
    const [completion] = await db
      .insert(exerciseCompletions)
      .values({
        userId: user.userId,
        exerciseId: body.exerciseId,
        durationSeconds: Math.round(body.durationSeconds),
      })
      .returning();
    return NextResponse.json({ completion }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "ثبت تمرین انجام نشد." },
      { status: 500 },
    );
  }
}
