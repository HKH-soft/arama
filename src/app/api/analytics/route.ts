import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db";
import { emotionLogs } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth();

        // Get emotion data for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const emotionData = await db
            .select({
                emotion: emotionLogs.emotion,
                avgScore: sql<number>`AVG(${emotionLogs.score})`,
                count: sql<number>`COUNT(*)`,
            })
            .from(emotionLogs)
            .where(eq(emotionLogs.userId, user.id))
            .groupBy(emotionLogs.emotion);

        // Get weekly emotion trends
        const weeklyData = await db
            .select({
                day: sql<string>`DATE(${emotionLogs.loggedAt}, 'unixepoch')`,
                avgScore: sql<number>`AVG(${emotionLogs.score})`,
            })
            .from(emotionLogs)
            .where(eq(emotionLogs.userId, user.id))
            .groupBy(sql`DATE(${emotionLogs.loggedAt}, 'unixepoch')`)
            .orderBy(sql`DATE(${emotionLogs.loggedAt}, 'unixepoch')`)
            .limit(7);

        return NextResponse.json({
            emotionBreakdown: emotionData,
            weeklyTrend: weeklyData,
        });
    } catch (err) {
        console.error("Analytics fetch error:", err);
        return NextResponse.json(
            { error: "خطا در دریافت تحلیل احساسات", details: err instanceof Error ? err.message : "خطای ناشناخته" },
            { status: 500 }
        );
    }
}