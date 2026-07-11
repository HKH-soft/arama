import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db";
import { subscriptions, subscriptionPlans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const subscription = await db
      .select({
        id: subscriptions.id,
        status: subscriptions.status,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        autoRenew: subscriptions.autoRenew,
        plan: {
          id: subscriptionPlans.id,
          name: subscriptionPlans.name,
          displayName: subscriptionPlans.displayName,
          description: subscriptionPlans.description,
          price: subscriptionPlans.price,
          durationDays: subscriptionPlans.durationDays,
          features: subscriptionPlans.features,
        },
      })
      .from(subscriptions)
      .leftJoin(
        subscriptionPlans,
        eq(subscriptions.planId, subscriptionPlans.id),
      )
      .where(eq(subscriptions.userId, user.id))
      .orderBy(desc(subscriptions.startDate))
      .limit(1);

    if (subscription.length === 0) {
      return NextResponse.json({ subscription: null });
    }

    return NextResponse.json({ subscription: subscription[0] });
  } catch (err) {
    console.error("Subscription fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت اشتراک" },
      { status: 500 },
    );
  }
}
