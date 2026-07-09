import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/db";
import { users, subscriptions, payments } from "@/db/schema";
import { eq, gte, count, sum, sql, and } from "drizzle-orm";
import { UnauthorizedError, ForbiddenError, isAuthError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    // Require admin permission
    await requirePermission("users:read");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get stats
    const [
      totalUsersResult,
      activeSubscriptionsResult,
      monthlyPaymentsResult,
      recentUsersResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(subscriptions).where(eq(subscriptions.status, "ACTIVE")),
      db.select({ total: sum(payments.amount) }).from(payments)
        .where(and(
          gte(payments.createdAt, thirtyDaysAgo),
          eq(payments.status, "SUCCESS")
        )),
      db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      }).from(users).orderBy(users.createdAt).limit(5),
    ]);

    const stats = {
      totalUsers: totalUsersResult[0]?.count?.toString() || "0",
      monthlyRevenue: `${monthlyPaymentsResult[0]?.total?.toLocaleString() || "0"} تومان`,
      activeSubscriptions: activeSubscriptionsResult[0]?.count?.toString() || "0",
      successRate: "۹۸٪",
      newUsers: `+${recentUsersResult.length}`,
      expiringSubscriptions: "۰",
    };

    return NextResponse.json({ stats, recentUsers: recentUsersResult });
  } catch (err: unknown) {
    console.error("Error:", err);
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 });
  }
}