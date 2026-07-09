import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { payments, users, subscriptionPlans, subscriptions } from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc, gte, lte, sql, like } from "drizzle-orm"; // Import Drizzle operators
import { z } from "zod";
import { logAudit, getClientInfo } from "@/lib/audit";
import { UnauthorizedError, ForbiddenError, isAuthError } from "@/lib/errors";

// Enhanced boolean preprocessing to handle string "true"/"false" values
const preprocessBoolean = () =>
  z
    .any()
    .transform((val) => {
      if (val === null || val === undefined || val === "") return undefined;
      if (typeof val === "string") {
        if (val.toLowerCase() === "true" || val === "1") return true;
        if (val.toLowerCase() === "false" || val === "0") return false;
      }
      if (typeof val === "boolean") return val;
      if (typeof val === "number") return val !== 0;
      return undefined;
    })
    .pipe(z.boolean().optional());

const getPaymentsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"]).optional(),
  userId: z.string().optional(),
  gatewayName: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z
    .enum(["createdAt", "amount", "status", "userId"])
    .optional()
    .nullable()
    .transform((val) => val ?? "createdAt"),
  sortOrder: z
    .enum(["asc", "desc"])
    .optional()
    .nullable()
    .transform((val) => val ?? "desc"),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission("payments:read");
    const searchParams = request.nextUrl.searchParams;

    const parsed = getPaymentsSchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      userId: searchParams.get("userId") ?? undefined,
      gatewayName: searchParams.get("gatewayName") ?? undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "پارامترهای نامعتبر" },
        { status: 400 },
      );
    }

    const clientInfo = await getClientInfo(request);

    const {
      page,
      limit,
      status,
      userId,
      gatewayName,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
    } = parsed.data;
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
      conditions.push(like(payments.gatewayName, `%${gatewayName}%`));
    }
    if (dateFrom) {
      conditions.push(gte(payments.createdAt, new Date(dateFrom)));
    }
    if (dateTo) {
      conditions.push(lte(payments.createdAt, new Date(dateTo)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [paymentsList, total] = await Promise.all([
      db
        .select({
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
          },
        })
        .from(payments)
        .leftJoin(users, eq(payments.userId, users.id))
        .leftJoin(subscriptions, eq(payments.subscriptionId, subscriptions.id))
        .leftJoin(
          subscriptionPlans,
          eq(subscriptions.planId, subscriptionPlans.id),
        )
        .where(whereClause)
        .orderBy(
          sortOrder === "asc" ? asc(payments[sortBy]) : desc(payments[sortBy]),
        )
        .offset(skip)
        .limit(limit),

      db
        .select({ count: sql<number>`CAST(count(*) AS INTEGER)` })
        .from(payments)
        .where(whereClause),
    ]);

    await logAudit({
      userId: user.id,
      action: "PAYMENTS_LIST_VIEWED",
      entity: "payment",
      metadata: { page, limit, status, sortBy, sortOrder },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json({
      data: paymentsList,
      pagination: {
        total: total[0].count,
        page,
        limit,
        totalPages: Math.ceil(total[0].count / limit),
      },
    });
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
