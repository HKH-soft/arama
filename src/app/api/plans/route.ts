import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { subscriptionPlans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.sortOrder);

    return NextResponse.json(plans);
  } catch (err) {
    console.error("Plans fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت پلن‌ها" },
      { status: 500 },
    );
  }
}
