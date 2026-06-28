import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle abstraction layer
import { 
  subscriptionPlans
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc, sql } from 'drizzle-orm'; // Import Drizzle operators
import { z } from "zod";
import { randomUUID } from 'crypto';
import { logAudit, getClientInfo } from "@/lib/audit";

const getPlansSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(["createdAt", "name", "price", "durationDays"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission("plans:read");
    const searchParams = request.nextUrl.searchParams;
    
    const parsed = getPlansSchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      isActive: searchParams.get("isActive"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    });
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "پارامترهای نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { page, limit, isActive, sortBy, sortOrder } = parsed.data;
    const skip = (page - 1) * limit;
    
    // Build where clause
    let conditions: any[] = [];
    
    if (isActive !== undefined) {
      conditions.push(eq(subscriptionPlans.isActive, isActive));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Build the order by clause based on the allowed sort fields
    let orderByClause;
    switch (sortBy) {
      case 'createdAt':
        orderByClause = sortOrder === 'asc' ? asc(subscriptionPlans.createdAt) : desc(subscriptionPlans.createdAt);
        break;
      case 'name':
        orderByClause = sortOrder === 'asc' ? asc(subscriptionPlans.name) : desc(subscriptionPlans.name);
        break;
      case 'price':
        orderByClause = sortOrder === 'asc' ? asc(subscriptionPlans.price) : desc(subscriptionPlans.price);
        break;
      case 'durationDays':
        orderByClause = sortOrder === 'asc' ? asc(subscriptionPlans.durationDays) : desc(subscriptionPlans.durationDays);
        break;
      default:
        orderByClause = desc(subscriptionPlans.createdAt);
    }
    
    const plans = await db.select()
      .from(subscriptionPlans)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(skip);
    
    // Count total plans
    const totalQuery = await db.select({ count: { count: subscriptionPlans.id } })
      .from(subscriptionPlans)
      .where(whereClause);
    const total = totalQuery.length > 0 ? Number(totalQuery[0].count) : 0;
    
    return NextResponse.json({
      data: plans,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Admin plans fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت پلن‌ها", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}

// Create new plan
const createPlanSchema = z.object({
  name: z.string().min(1, "نام الزامی است"),
  displayName: z.string().min(1, "نام نمایشی الزامی است").optional(),
  description: z.string().optional(),
  price: z.number().positive("قیمت باید مثبت باشد"),
  durationDays: z.number().positive("مدت زمان باید مثبت باشد"),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission("plans:write");
    const clientInfo = getClientInfo(request);
    
    const body = await request.json();
    const parsed = createPlanSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { name, displayName, description, price, durationDays, features, isActive } = parsed.data;
    
    const newPlan = await db.insert(subscriptionPlans)
      .values({
        id: randomUUID(),
        name,
        displayName: displayName || name, // Use name as fallback if displayName not provided
        description: description || null,
        price,
        durationDays,
        features: features || [],
        isActive: isActive || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    // Log audit
    await logAudit({
      userId: user.id,
      action: "PLAN_CREATED",
      entity: "subscription_plan",
      entityId: newPlan[0].id,
      metadata: { planName: name },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });
    
    return NextResponse.json(newPlan[0], { status: 201 });
  } catch (err) {
    console.error("Admin plan creation error:", err);
    return NextResponse.json(
      { error: "خطا در ایجاد پلن", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}