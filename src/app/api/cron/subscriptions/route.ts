import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma"; // Updated to use Drizzle
import { 
  subscriptions,
  users,
  subscriptionPlans
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc, sql, lte, gte } from 'drizzle-orm'; // Import Drizzle operators
import { logAudit } from "@/lib/audit";

// This endpoint should be called by a scheduled job (cron) to handle subscription expirations
export async function GET(request: NextRequest) {
  // Verify this is coming from a trusted source (e.g., via a secret header)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_AUTH_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // Define date thresholds
    const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Find subscriptions that have expired and are still active
    const expiredSubscriptions = await db.select({
      id: subscriptions.id,
      userId: subscriptions.userId,
      planId: subscriptions.planId,
      status: subscriptions.status,
      endDate: subscriptions.endDate,
      autoRenew: subscriptions.autoRenew,
    })
    .from(subscriptions)
    .where(and(
      eq(subscriptions.status, "ACTIVE"),
      sql`${subscriptions.endDate} < ${now}`
    ));

    // Update expired subscriptions
    for (const subscription of expiredSubscriptions) {
      await db.update(subscriptions)
        .set({ status: "EXPIRED" })
        .where(eq(subscriptions.id, subscription.id));

      // Log audit
      await logAudit({
        userId: subscription.userId,
        action: "SUBSCRIPTION_EXPIRED",
        entity: "subscription",
        entityId: subscription.id,
        metadata: { 
          subscriptionId: subscription.id,
          userId: subscription.userId,
          expiredAt: now
        },
      });

      // If autoRenew is enabled, attempt renewal
      if (subscription.autoRenew) {
        // In a real implementation, you'd charge the user's payment method here
        // For now, we'll just extend the subscription for another period
        const planResult = await db.select()
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.id, subscription.planId));
        
        const plan = planResult[0];
        if (plan && plan.durationDays) {
          const newEndDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
          
          await db.update(subscriptions)
            .set({
              status: "ACTIVE",
              startDate: now,
              endDate: newEndDate,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, subscription.id));

          // Log renewal audit
          await logAudit({
            userId: subscription.userId,
            action: "SUBSCRIPTION_RENEWED",
            entity: "subscription",
            entityId: subscription.id,
            metadata: { 
              subscriptionId: subscription.id,
              userId: subscription.userId,
              renewedAt: now,
              newEndDate
            },
          });
        }
      }
    }

    // Find subscriptions ending soon (within 7 days) to send notifications
    const expiringSubscriptions = await db.select({
      id: subscriptions.id,
      userId: subscriptions.userId,
      endDate: subscriptions.endDate,
    })
    .from(subscriptions)
    .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(and(
      eq(subscriptions.status, "ACTIVE"),
      gte(subscriptions.endDate, now),
      lte(subscriptions.endDate, sevenDaysFromNow)
    ))
    .orderBy(desc(subscriptions.endDate));
    
    // Group by notification period
    const expiringIn1Day = expiringSubscriptions.filter(sub => 
      sub.endDate && sub.endDate <= oneDayFromNow && sub.endDate > now
    );
    const expiringIn3Days = expiringSubscriptions.filter(sub => 
      sub.endDate && sub.endDate <= threeDaysFromNow && sub.endDate > oneDayFromNow
    );
    const expiringIn7Days = expiringSubscriptions.filter(sub => 
      sub.endDate && sub.endDate <= sevenDaysFromNow && sub.endDate > threeDaysFromNow
    );
    
    // In a real implementation, we would send emails here
    // For now, we'll just log the fact that we would send notifications
    for (const subscription of expiringIn1Day) {
      await logAudit({
        userId: subscription.userId,
        action: "SUBSCRIPTION_ENDING_IN_1_DAY",
        entity: "subscription",
        entityId: subscription.id,
        metadata: { 
          subscriptionId: subscription.id,
          userId: subscription.userId,
          endingAt: subscription.endDate
        },
      });
    }
    
    for (const subscription of expiringIn3Days) {
      await logAudit({
        userId: subscription.userId,
        action: "SUBSCRIPTION_ENDING_IN_3_DAYS",
        entity: "subscription",
        entityId: subscription.id,
        metadata: { 
          subscriptionId: subscription.id,
          userId: subscription.userId,
          endingAt: subscription.endDate
        },
      });
    }
    
    for (const subscription of expiringIn7Days) {
      await logAudit({
        userId: subscription.userId,
        action: "SUBSCRIPTION_ENDING_IN_7_DAYS",
        entity: "subscription",
        entityId: subscription.id,
        metadata: { 
          subscriptionId: subscription.id,
          userId: subscription.userId,
          endingAt: subscription.endDate
        },
      });
    }

    return NextResponse.json({
      message: "Subscription maintenance completed",
      expiredCount: expiredSubscriptions.length,
      expiringSoonCount: expiringSubscriptions.length,
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}