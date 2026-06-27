import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/prisma"; // Updated to use Drizzle
import { 
  auditLogs,
  users
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

const getAuditLogsSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  action: z.string().optional(),
  userId: z.string().optional(),
  entity: z.string().optional(),
  entityId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(["timestamp", "action", "userId"]).default("timestamp"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission("audit:read");
    const searchParams = request.nextUrl.searchParams;
    
    const parsed = getAuditLogsSchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      action: searchParams.get("action"),
      userId: searchParams.get("userId"),
      entity: searchParams.get("entity"),
      entityId: searchParams.get("entityId"),
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
    
    const { page, limit, action, userId, entity, entityId, dateFrom, dateTo, sortBy, sortOrder } = parsed.data;
    const skip = (page - 1) * limit;
    
    // Build where clause
    let conditions: any[] = [];
    
    if (action) {
      conditions.push(ilike(auditLogs.action, `%${action}%`));
    }
    if (userId) {
      conditions.push(eq(auditLogs.userId, userId));
    }
    if (entity) {
      conditions.push(ilike(auditLogs.entity, `%${entity}%`));
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
      db.select({
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
        }
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(whereClause)
      .orderBy(sortOrder === "asc" ? asc(auditLogs[sortBy]) : desc(auditLogs[sortBy]))
      .offset(skip)
      .limit(limit),
      
      db.select({ count: sql<number>`count(*)::int` })
        .from(auditLogs)
        .where(whereClause)
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
  } catch (err) {
    console.error("Admin audit logs fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت لاگ‌های حسابرسی", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}