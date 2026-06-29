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
            { error: "خطا در دریافت وضعیت خلقی", details: err instanceof Error ? err.message : "خطای ناشناخته" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const { mood } = body;

        if (!mood) {
            return NextResponse.json(
                { error: "مشخصات ناقص است" },
                { status: 400 }
            );
        }

        const result = await db.insert(moodEntries).values({
            id: `${Date.now()}-${Math.random()}`,
            userId: user.id,
            mood,
            loggedAt: new Date(),
        }).returning();

        return NextResponse.json(result[0]);
    } catch (err) {
        console.error("Mood creation error:", err);
        return NextResponse.json(
            { error: "خطا در ثبت وضعیت خلقی", details: err instanceof Error ? err.message : "خطای ناشناخته" },
            { status: 500 }
        );
    }
}