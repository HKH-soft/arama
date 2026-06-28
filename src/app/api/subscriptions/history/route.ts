import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { 
  subscriptions,
  subscriptionPlans
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc, sql } from 'drizzle-orm'; // Import Drizzle operators

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    const [subscriptionsList, total] = await Promise.all([
      db.select({
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
      .where(eq(subscriptions.userId, user.id))
      .orderBy(desc(subscriptions.createdAt))
      .offset(skip)
      .limit(limit),
      
      db.select({ count: sql<number>`count(*)::int` })
        .from(subscriptions)
        .where(eq(subscriptions.userId, user.id))
    ]);

    return NextResponse.json({
      data: subscriptionsList,
      pagination: {
        total: total[0].count,
        page,
        limit,
        totalPages: Math.ceil(total[0].count / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch subscription history:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription history" },
      { status: 500 }
    );
  }
}