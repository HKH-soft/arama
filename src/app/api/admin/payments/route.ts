import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/prisma"; // Updated to use Drizzle
import { 
  payments,
  users,
  subscriptionPlans,
  subscriptions
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

const getPaymentsSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  status: z.enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"]).optional(),
  userId: z.string().optional(),
  gatewayName: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(["createdAt", "amount", "status", "userId"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission("payments:read");
    const searchParams = request.nextUrl.searchParams;
    
    const parsed = getPaymentsSchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
      userId: searchParams.get("userId"),
      gatewayName: searchParams.get("gatewayName"),
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
    
    const { page, limit, status, userId, gatewayName, dateFrom, dateTo, sortBy, sortOrder } = parsed.data;
    const skip = (page - 1) * limit;
    
    // Build where clause
    let conditions: any[] = [];
    
    if (status) {
      conditions.push(eq(payments.status, status));
    }
    if (userId) {
      conditions.push(eq(payments.userId, userId));
    }
    if (gatewayName) {
      conditions.push(ilike(payments.gatewayName, `%${gatewayName}%`));
    }
    if (dateFrom) {
      conditions.push(gte(payments.createdAt, new Date(dateFrom)));
    }
    if (dateTo) {
      conditions.push(lte(payments.createdAt, new Date(dateTo)));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [paymentsList, total] = await Promise.all([
      db.select({
        id: payments.id,
        userId: payments.userId,
        subscriptionId: payments.subscriptionId,
        amount: payments.amount,
        currency: payments.currency,
        status: payments.status,
        gatewayName: payments.gatewayName,
        gatewayRefId: payments.gatewayRefId,
        description: payments.description,
        callbackUrl: payments.callbackUrl,
        paidAt: payments.paidAt,
        createdAt: payments.createdAt,
        updatedAt: payments.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        subscription: {
          id: subscriptions.id,
          status: subscriptions.status,
          startDate: subscriptions.startDate,
          endDate: subscriptions.endDate,
        },
        plan: {
          id: subscriptionPlans.id,
          name: subscriptionPlans.name,
          displayName: subscriptionPlans.displayName,
          price: subscriptionPlans.price,
        }
      })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .leftJoin(subscriptions, eq(payments.subscriptionId, subscriptions.id))
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(whereClause)
      .orderBy(sortOrder === "asc" ? asc(payments[sortBy]) : desc(payments[sortBy]))
      .offset(skip)
      .limit(limit),
      
      db.select({ count: sql<number>`count(*)::int` })
        .from(payments)
        .where(whereClause)
    ]);
    
    return NextResponse.json({
      data: paymentsList,
      pagination: {
        total: total[0].count,
        page,
        limit,
        totalPages: Math.ceil(total[0].count / limit),
      },
    });
  } catch (err) {
    console.error("Admin payments fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت پرداخت‌ها", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}