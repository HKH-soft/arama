import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
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
    const clientInfo = await getClientInfo(); // Changed to await

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

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { subscriptionId, cancellationReason } = await request.json();

    // Find user's active subscription
    const originalSubscriptionResult = await db.select({
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
      eq(subscriptions.id, subscriptionId),
      eq(subscriptions.status, "ACTIVE")
    ));

    if (originalSubscriptionResult.length === 0) {
      return NextResponse.json(
        { error: "اشتراک مورد نظر یافت نشد یا قبلا لغو شده است" },
        { status: 404 }
      );
    }

    const originalSubscription = originalSubscriptionResult[0];

    const updatedSubscription = await db
      .update(subscriptions)
      .set({
        status: "CANCELED",
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscriptionId))
      .returning();

    const clientInfo = await getClientInfo();  // Changed to await
    
    // Log audit
    await logAudit({
      userId: user.id,
      action: "SUBSCRIPTION_CANCELED",
      entity: "subscription",
      entityId: subscriptionId,
      metadata: {
        planId: originalSubscription.plan?.id || originalSubscription.planId,
        originalEndDate: originalSubscription.endDate,
        cancellationReason: cancellationReason || "User initiated",
      },
      ipAddress: clientInfo.ipAddress,  // This should now work since clientInfo is awaited
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription[0],
      message: "اشتراک با موفقیت لغو شد"
    });
  } catch (err) {
    console.error("Subscription cancellation error:", err);
    return NextResponse.json(
      { error: "خطا در لغو اشتراک", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}