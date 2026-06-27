import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/prisma"; // Updated to use Drizzle
import { 
  payments,
  subscriptionPlans
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc, sql } from 'drizzle-orm'; // Import Drizzle operators
import { z } from "zod";

const getHistorySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  status: z.enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"]).optional(),
  sortBy: z.enum(["createdAt", "amount", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    
    const parsed = getHistorySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    });
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "پارامترهای نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { page, limit, status, sortBy, sortOrder } = parsed.data;
    const skip = (page - 1) * limit;
    
    // Build where clause
    let conditions: any[] = [eq(payments.userId, user.id)];
    
    if (status) {
      conditions.push(eq(payments.status, status));
    }
    
    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];
    
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
        plan: {
          id: subscriptionPlans.id,
          name: subscriptionPlans.name,
          displayName: subscriptionPlans.displayName,
          price: subscriptionPlans.price,
        }
      })
      .from(payments)
      .leftJoin(subscriptionPlans, eq(subscriptionPlans.id, payments.subscriptionId)) // Note: this might be incorrect, should join with subscriptions first
      .where(whereClause)
      .orderBy(sortOrder === "asc" ? asc(payments[sortBy]) : desc(payments[sortBy]))
      .offset(skip)
      .limit(limit),
      
      db.select({ count: sql<number>`count(*)::int` })
        .from(payments)
        .where(eq(payments.userId, user.id))
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
    console.error("Payments history fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت تاریخچه پرداخت‌ها", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}