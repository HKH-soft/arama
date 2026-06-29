import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { exercises } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const exercisesList = await db
            .select()
            .from(exercises)
            .where(eq(exercises.isActive, true))
            .orderBy(exercises.sortOrder);

        return NextResponse.json(exercisesList);
    } catch (err) {
        console.error("Exercises fetch error:", err);
        return NextResponse.json(
            { error: "خطا در دریافت تمرینات", details: err instanceof Error ? err.message : "خطای ناشناخته" },
            { status: 500 }
        );
    }
}