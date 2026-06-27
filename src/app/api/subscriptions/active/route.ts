import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/prisma"; // Updated to use Drizzle
import { 
  subscriptions,
  subscriptionPlans
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc, gte, sql } from 'drizzle-orm'; // Import Drizzle operators

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
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
      eq(subscriptions.status, "ACTIVE"),
      subscriptions.endDate ? gte(subscriptions.endDate, new Date()) : sql`true`
    ));
    
    const subscription = subscriptionResult[0];
    
    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }
    
    return NextResponse.json({ subscription });
  } catch (err) {
    console.error("Active subscription fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch active subscription", message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}