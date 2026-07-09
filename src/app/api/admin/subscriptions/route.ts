import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { subscriptions, users, subscriptionPlans } from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc, gte, lte, sql, ilike } from "drizzle-orm"; // Import Drizzle operators
import { z } from "zod";
import { logAudit, getClientInfo } from "@/lib/audit";
import { UnauthorizedError, ForbiddenError, isAuthError } from "@/lib/errors";
import { preprocessBoolean } from "@/lib/validators/admin";

const getSubscriptionsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.enum(["ACTIVE", "INACTIVE", "CANCELED", "EXPIRED"]).optional(),
  userId: z.string().optional(),
  planId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z
    .enum(["createdAt", "startDate", "endDate", "status", "userId"])
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
    const user = await requirePermission("subscriptions:read");
    const searchParams = request.nextUrl.searchParams;

    const parsed = getSubscriptionsSchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      userId: searchParams.get("userId") ?? undefined,
      planId: searchParams.get("planId") ?? undefined,
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
      planId,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
    } = parsed.data;
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
      db
        .select({
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
          },
        })
        .from(subscriptions)
        .leftJoin(users, eq(subscriptions.userId, users.id))
        .leftJoin(
          subscriptionPlans,
          eq(subscriptions.planId, subscriptionPlans.id),
        )
        .where(whereClause)
        .orderBy(
          sortOrder === "asc"
            ? asc(subscriptions[sortBy])
            : desc(subscriptions[sortBy]),
        )
        .offset(skip)
        .limit(limit),

      db
        .select({ count: sql<number>`CAST(count(*) AS INTEGER)` })
        .from(subscriptions)
        .where(whereClause),
    ]);

    await logAudit({
      userId: user.id,
      action: "SUBSCRIPTIONS_LIST_VIEWED",
      entity: "subscription",
      metadata: { page, limit, status, sortBy, sortOrder },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json({
      data: subscriptionsList,
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
