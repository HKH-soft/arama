import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/prisma"; // Updated to use Drizzle
import { 
  subscriptions,
  users,
  subscriptionPlans
} from "@/db/schema"; // Import Drizzle tables
import { 
  eq, 
  and, 
  asc, 
  desc, 
  gte, 
  lte,
  sql,
  ilike
} from 'drizzle-orm'; // Import Drizzle operators
import { z } from "zod";

const getSubscriptionsSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  status: z.enum(["ACTIVE", "INACTIVE", "CANCELED", "EXPIRED"]).optional(),
  userId: z.string().optional(),
  planId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(["createdAt", "startDate", "endDate", "status", "userId"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission("subscriptions:read");
    const searchParams = request.nextUrl.searchParams;
    
    const parsed = getSubscriptionsSchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
      userId: searchParams.get("userId"),
      planId: searchParams.get("planId"),
      dateFrom: searchParams.get("dateFrom"),
      dateTo: searchParams.get("dateTo"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    });
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "پارامترهای نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { page, limit, status, userId, planId, dateFrom, dateTo, sortBy, sortOrder } = parsed.data;
    const skip = (page - 1) * limit;
    
    // Build where clause
    let conditions: any[] = [];
    
    if (status) {
      conditions.push(eq(subscriptions.status, status));
    }
    if (userId) {
      conditions.push(eq(subscriptions.userId, userId));
    }
    if (planId) {
      conditions.push(eq(subscriptions.planId, planId));
    }
    if (dateFrom) {
      conditions.push(gte(subscriptions.createdAt, new Date(dateFrom)));
    }
    if (dateTo) {
      conditions.push(lte(subscriptions.createdAt, new Date(dateTo)));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
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
        }
      })
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.userId, users.id))
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(whereClause)
      .orderBy(sortOrder === "asc" ? asc(subscriptions[sortBy]) : desc(subscriptions[sortBy]))
      .offset(skip)
      .limit(limit),
      
      db.select({ count: sql<number>`count(*)::int` })
        .from(subscriptions)
        .where(whereClause)
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
  } catch (err) {
    console.error("Admin subscriptions fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت اشتراک‌ها", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}