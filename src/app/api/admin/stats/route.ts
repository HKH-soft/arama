import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { 
  users,
  subscriptions,
  payments,
  conversations
} from "@/db/schema"; // Import Drizzle tables
import { 
  eq, 
  and, 
  asc, 
  desc, 
  gte, 
  lte,
  sql
} from 'drizzle-orm'; // Import Drizzle operators

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission("users:read");
    const searchParams = request.nextUrl.searchParams;
    
    const dateFrom = searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined;
    const dateTo = searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined;
    
    // Build where clauses
    let userConditions: any[] = [];
    let subscriptionConditions: any[] = [];
    let paymentConditions: any[] = [];
    
    if (dateFrom) {
      userConditions.push(gte(users.createdAt, dateFrom));
      subscriptionConditions.push(gte(subscriptions.createdAt, dateFrom));
      paymentConditions.push(gte(payments.createdAt, dateFrom));
    }
    if (dateTo) {
      userConditions.push(lte(users.createdAt, dateTo));
      subscriptionConditions.push(lte(subscriptions.createdAt, dateTo));
      paymentConditions.push(lte(payments.createdAt, dateTo));
    }
    
    const userWhereClause = userConditions.length > 0 ? and(...userConditions) : undefined;
    const subscriptionWhereClause = subscriptionConditions.length > 0 ? and(...subscriptionConditions) : undefined;
    const paymentWhereClause = paymentConditions.length > 0 ? and(...paymentConditions) : undefined;
    
    // Get stats
    const [
      userStats,
      subscriptionCount,
      paymentStats,
      paymentCount,
      userCount,
      activeSubscriptionCount,
      activeUsersCount
    ] = await Promise.all([
      // Total users stats
      db.select({
        count: sql<number>`count(*)::int`,
        totalRevenue: sql<number>`COALESCE(sum(${payments.amount}), 0)`
      })
      .from(users)
      .where(userWhereClause),
      
      // Total subscriptions
      db.select({ count: sql<number>`count(*)::int` })
        .from(subscriptions)
        .where(subscriptionWhereClause),
      
      // Total revenue
      db.select({
        totalRevenue: sql<number>`COALESCE(sum(${payments.amount}), 0)`
      })
      .from(payments)
      .where(paymentWhereClause),
      
      // Total payments
      db.select({ count: sql<number>`count(*)::int` })
        .from(payments)
        .where(paymentWhereClause),
      
      // Total users
      db.select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(userWhereClause),
      
      // Active subscriptions
      db.select({ count: sql<number>`count(*)::int` })
        .from(subscriptions)
        .where(and(
          eq(subscriptions.status, "ACTIVE"),
          subscriptionWhereClause ? subscriptionWhereClause : undefined
        )),
      
      // Active users (users with active subscriptions)
      db.select({ count: sql<number>`count(distinct ${users.id})::int` })
        .from(users)
        .innerJoin(subscriptions, eq(users.id, subscriptions.userId))
        .where(and(
          eq(subscriptions.status, "ACTIVE"),
          subscriptionWhereClause ? subscriptionWhereClause : undefined
        ))
    ]);
    
    return NextResponse.json({
      data: {
        totalUsers: userCount[0].count,
        totalSubscriptions: subscriptionCount[0].count,
        totalActiveSubscriptions: activeSubscriptionCount[0].count,
        totalPayments: paymentCount[0].count,
        totalRevenue: paymentStats[0].totalRevenue,
        activeUsers: activeUsersCount[0].count,
        registrationTrend: [] // Could add trend calculation here if needed
      },
    });
  } catch (err) {
    console.error("Admin stats fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت آمار", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}