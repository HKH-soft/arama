import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { ensureExercises } from "@/lib/demo-data";

export async function GET() {
  try {
    await ensureExercises();
    const rows = await db.select().from(exercises).orderBy(asc(exercises.createdAt));
    return NextResponse.json({ exercises: rows, categories: ["همه", "کاهش اضطراب", "شناختی", "تنفس", "خودمراقبتی", "روابط", "قدردانی"] });
  } catch {
    return NextResponse.json({ error: "تمرین‌ها فعلاً در دسترس نیستند." }, { status: 503 });
  }
}
