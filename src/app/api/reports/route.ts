import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db";
import { reports } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth();

        const userReports = await db
            .select()
            .from(reports)
            .where(eq(reports.userId, user.id))
            .orderBy(desc(reports.reportDate));

        return NextResponse.json(userReports);
    } catch (err) {
        console.error("Reports fetch error:", err);
        return NextResponse.json(
            { error: "خطا در دریافت گزارش‌ها", details: err instanceof Error ? err.message : "خطای ناشناخته" },
            { status: 500 }
        );
    }
}

