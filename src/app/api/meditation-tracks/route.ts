import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { meditationTracks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const tracks = await db
      .select()
      .from(meditationTracks)
      .where(eq(meditationTracks.isActive, true))
      .orderBy(meditationTracks.sortOrder);

    return NextResponse.json(tracks);
  } catch (err) {
    console.error("Meditation tracks fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت مدیتیشن‌ها" },
      { status: 500 },
    );
  }
}
