import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { subscriptions, subscriptionPlans } from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc } from "drizzle-orm"; // Import Drizzle operators
import { logAudit, getClientInfo } from "@/lib/audit";
import { z } from "zod";

const renewSubscriptionSchema = z.object({
  planId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const clientInfo = await getClientInfo(request);

    // Get current subscription
    const subscriptionResult = await db
      .select({
        id: subscriptions.id,
        userId: subscriptions.userId,
        planId: subscriptions.planId,
        status: subscriptions.status,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        plan: {
          id: subscriptionPlans.id,
          name: subscriptionPlans.name,
          displayName: subscriptionPlans.displayName,
          description: subscriptionPlans.description,
          price: subscriptionPlans.price,
          durationDays: subscriptionPlans.durationDays,
          features: subscriptionPlans.features,
          maxConversations: subscriptionPlans.maxConversations,
          maxMessagesPerDay: subscriptionPlans.maxMessagesPerDay,
          isActive: subscriptionPlans.isActive,
          sortOrder: subscriptionPlans.sortOrder,
        },
      })
      .from(subscriptions)
      .leftJoin(
        subscriptionPlans,
        eq(subscriptions.planId, subscriptionPlans.id),
      )
      .where(
        and(
          eq(subscriptions.userId, user.id),
          eq(subscriptions.status, "ACTIVE"),
        ),
      );

    const subscription = subscriptionResult[0];
    if (!subscription || !subscription.plan) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 },
      );
    }

    // Calculate new end date based on plan duration
    const newEndDate = subscription.plan.durationDays
      ? new Date(
          Date.now() + subscription.plan.durationDays * 24 * 60 * 60 * 1000,
        )
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days if no duration specified

    // Renew subscription
    const renewedSubscriptionResult = await db
      .update(subscriptions)
      .set({
        startDate: new Date(),
        endDate: newEndDate,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id))
      .returning();

    // Log audit
    await logAudit({
      userId: user.id,
      action: "SUBSCRIPTION_RENEWED",
      entity: "subscription",
      entityId: subscription.id,
      metadata: { planId: subscription.planId },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json(renewedSubscriptionResult[0]);
  } catch (error) {
    console.error("Failed to renew subscription:", error);
    return NextResponse.json(
      { error: "Failed to renew subscription" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { planId } = await request.json();

    const planResult = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId));
    if (planResult.length === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const plan = planResult[0];
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const subscriptionResult = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id))
      .get();
    if (!subscriptionResult) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    const subscriptionId = subscriptionResult.id;

    const updatedSubscription = await db
      .update(subscriptions)
      .set({
        status: "ACTIVE",
        startDate: new Date(),
        endDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000), // Recalculate end date
        cancelledAt: null, // Clear cancellation date
        autoRenew: true, // Reset auto-renew to true
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscriptionId))
      .returning();

    const clientInfo = await getClientInfo(request); // Fixed to pass request parameter

    // Log audit
    await logAudit({
      userId: user.id,
      action: "SUBSCRIPTION_RENEWED",
      entity: "subscription",
      entityId: subscriptionId,
      metadata: {
        planId: plan.id,
        planName: plan.displayName,
        newStartDate: updatedSubscription[0].startDate,
        newEndDate: updatedSubscription[0].endDate,
        price: plan.price,
      },
      ipAddress: clientInfo.ipAddress, // This should now work since clientInfo is awaited
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription[0],
      message: "اشتراک با موفقیت تمدید شد",
    });
  } catch (err) {
    console.error("Subscription renewal error:", err);
    return NextResponse.json({ error: "خطا در تمدید اشتراک" }, { status: 500 });
  }
}
