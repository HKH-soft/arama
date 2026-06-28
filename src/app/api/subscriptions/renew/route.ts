import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { 
  subscriptions,
  subscriptionPlans
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc } from 'drizzle-orm'; // Import Drizzle operators
import { logAudit, getClientInfo } from "@/lib/audit";
import { z } from "zod";

const renewSubscriptionSchema = z.object({
  planId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const clientInfo = getClientInfo(request);
    
    // Get current subscription
    const subscriptionResult = await db.select({
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
      }
    })
    .from(subscriptions)
    .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(and(
      eq(subscriptions.userId, user.id),
      eq(subscriptions.status, "ACTIVE")
    ));
    
    const subscription = subscriptionResult[0];
    if (!subscription || !subscription.plan) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }
    
    // Calculate new end date based on plan duration
    const newEndDate = subscription.plan.durationDays
      ? new Date(Date.now() + subscription.plan.durationDays * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days if no duration specified
    
    // Renew subscription
    const renewedSubscriptionResult = await db.update(subscriptions)
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
      { status: 500 }
    );
  }
}