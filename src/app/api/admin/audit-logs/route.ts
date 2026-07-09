import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { auditLogs, users } from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc, gte, lte, sql, like } from "drizzle-orm"; // Import Drizzle operators
import { z } from "zod";
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

const getAuditLogsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  action: z.string().optional(),
  userId: z.string().optional(),
  entity: z.string().optional(),
  entityId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z
    .enum(["timestamp", "action", "userId"])
    .optional()
    .nullable()
    .transform((val) => val ?? "timestamp"),
  sortOrder: z
    .enum(["asc", "desc"])
    .optional()
    .nullable()
    .transform((val) => val ?? "desc"),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission("audit:read");
    const searchParams = request.nextUrl.searchParams;

    const parsed = getAuditLogsSchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      action: searchParams.get("action") ?? undefined,
      userId: searchParams.get("userId") ?? undefined,
      entity: searchParams.get("entity") ?? undefined,
      entityId: searchParams.get("entityId") ?? undefined,
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

    const {
      page,
      limit,
      action,
      userId,
      entity,
      entityId,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
    } = parsed.data;
    const skip = (page - 1) * limit;

    // Build where clause
    let conditions: any[] = [];

    if (action) {
      conditions.push(like(auditLogs.action, `%${action}%`));
    }
    if (userId) {
      conditions.push(eq(auditLogs.userId, userId));
    }
    if (entity) {
      conditions.push(like(auditLogs.entity, `%${entity}%`));
    }
    if (entityId) {
      conditions.push(eq(auditLogs.entityId, entityId));
    }
    if (dateFrom) {
      conditions.push(gte(auditLogs.timestamp, new Date(dateFrom)));
    }
    if (dateTo) {
      conditions.push(lte(auditLogs.timestamp, new Date(dateTo)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [auditLogsList, total] = await Promise.all([
      db
        .select({
          id: auditLogs.id,
          userId: auditLogs.userId,
          action: auditLogs.action,
          entity: auditLogs.entity,
          entityId: auditLogs.entityId,
          metadata: auditLogs.metadata,
          ipAddress: auditLogs.ipAddress,
          userAgent: auditLogs.userAgent,
          timestamp: auditLogs.timestamp,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .where(whereClause)
        .orderBy(
          sortOrder === "asc"
            ? asc(auditLogs[sortBy])
            : desc(auditLogs[sortBy]),
        )
        .offset(skip)
        .limit(limit),

      db
        .select({ count: sql<number>`CAST(count(*) AS INTEGER)` })
        .from(auditLogs)
        .where(whereClause),
    ]);

    return NextResponse.json({
      data: auditLogsList,
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
