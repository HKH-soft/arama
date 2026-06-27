import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/prisma"; // Updated to use Drizzle
import { 
  subscriptions,
  users,
  subscriptionPlans
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc } from 'drizzle-orm'; // Import Drizzle operators
import { logAudit, getClientInfo } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const clientInfo = getClientInfo(request);

    // Find user's active subscription
    const subscriptionResult = await db.select({
      id: subscriptions.id,
      userId: subscriptions.userId,
      planId: subscriptions.planId,
      status: subscriptions.status,
      startDate: subscriptions.startDate,
      endDate: subscriptions.endDate,
      cancelledAt: subscriptions.cancelledAt,
      autoRenew: subscriptions.autoRenew,
      paymentGatewayRef: subscriptions.paymentGatewayRef,
      createdAt: subscriptions.createdAt,
      updatedAt: subscriptions.updatedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      plan: {
        id: subscriptionPlans.id,
        name: subscriptionPlans.name,
        displayName: subscriptionPlans.displayName,
        price: subscriptionPlans.price,
        durationDays: subscriptionPlans.durationDays,
      }
    })
    .from(subscriptions)
    .leftJoin(users, eq(subscriptions.userId, users.id))
    .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(and(
      eq(subscriptions.userId, user.id),
      eq(subscriptions.status, "ACTIVE")
    ));
    
    if (subscriptionResult.length === 0) {
      return NextResponse.json(
        { error: "هیچ اشتراک فعالی یافت نشد" },
        { status: 404 }
      );
    }

    const subscription = subscriptionResult[0];

    // Update subscription to cancelled status
    const updatedSubscriptionResult = await db.update(subscriptions)
      .set({
        status: "CANCELED",
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id))
      .returning();

    // Log audit
    await logAudit({
      userId: user.id,
      action: "SUBSCRIPTION_CANCELLED",
      entity: "subscription",
      entityId: subscription.id,
      metadata: { planId: subscription.planId, reason: "user_request" },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json(updatedSubscriptionResult[0]);
  } catch (err) {
    console.error("Cancel subscription error:", err);
    return NextResponse.json(
      { error: "خطا در لغو اشتراک", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}