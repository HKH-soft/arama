import { and, asc, ilike, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { meditationTracks } from "@/db/schema";
import { ensureMeditationTracks } from "@/lib/demo-data";

export async function GET(request: NextRequest) {
  try {
    await ensureMeditationTracks();
    const search = request.nextUrl.searchParams.get("search")?.trim();
    const category = request.nextUrl.searchParams.get("category")?.trim();
    const filters = [];
    if (search) {
      filters.push(or(ilike(meditationTracks.title, `%${search}%`), ilike(meditationTracks.description, `%${search}%`)));
    }
    if (category && category !== "همه") filters.push(ilike(meditationTracks.category, category));
    const rows = await db
      .select()
      .from(meditationTracks)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(asc(meditationTracks.createdAt));
    return NextResponse.json({ tracks: rows, categories: ["همه", "خواب", "تمرکز", "کاهش اضطراب", "تنفس"] });
  } catch {
    return NextResponse.json({ error: "کتابخانهٔ مدیتیشن فعلاً در دسترس نیست." }, { status: 503 });
  }
}
