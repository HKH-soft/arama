import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/db";
import { subscriptionPlans } from "@/db/schema";
import { eq, and, asc, desc, count } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";
import { logAudit, getClientInfo } from "@/lib/audit";
import { preprocessBoolean } from "@/lib/validators/admin"; // Import the enhanced validator

// Zod schema for creating a plan
const createPlanSchema = z.object({
  name: z.string().min(1, "نام الزامی است"),
  displayName: z.string().min(1, "نام نمایشی الزامی است"),
  description: z.string().optional(),
  price: z.number().positive("قیمت باید عددی مثبت باشد"),
  durationDays: z.number().positive("مدت زمان باید عددی مثبت باشد"),
  features: z.array(z.string()).optional(),
  maxConversations: z.number().nonnegative().optional(),
  maxMessagesPerDay: z.number().nonnegative().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission("plans:read");
    const clientInfo = await getClientInfo(); // Changed to await

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const searchTerm = searchParams.get("searchTerm") || "";
    const isActive = searchParams.get("isActive");

    // Build conditions array
    const conditions = [];
    if (searchTerm) {
      conditions.push(
        eq(subscriptionPlans.displayName, searchTerm)
      );
    }
    if (isActive) {
      const isActiveBool = isActive === "true";
      conditions.push(eq(subscriptionPlans.isActive, isActiveBool));
    }

    // Build where clause
    let whereClause;
    if (conditions.length > 0) {
      whereClause = and(...conditions);
    }

    // Build order by clause
    let orderByClause;
    switch (sortBy) {
      case "name":
        orderByClause = sortOrder === "asc" ? asc(subscriptionPlans.name) : desc(subscriptionPlans.name);
        break;
      case "price":
        orderByClause = sortOrder === "asc" ? asc(subscriptionPlans.price) : desc(subscriptionPlans.price);
        break;
      case "durationDays":
        orderByClause = sortOrder === "asc" ? asc(subscriptionPlans.durationDays) : desc(subscriptionPlans.durationDays);
        break;
      default:
        orderByClause = desc(subscriptionPlans.createdAt);
    }

    // Query plans with pagination
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset((page - 1) * limit);

    // Get total count for pagination
    const countResult = await db
      .select({ count: count() })
      .from(subscriptionPlans)
      .where(whereClause);
    const totalCount = countResult[0].count;

    // Log audit
    await logAudit({
      userId: user.id,
      action: "PLANS_LIST_VIEWED",
      entity: "subscription_plans",
      metadata: { page, limit, sortBy, sortOrder, searchTerm, isActive },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json({
      data: plans,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    console.error("Admin plans list error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت لیست پلن‌ها", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission("plans:write");
    const clientInfo = await getClientInfo(); // Changed to await

    const body = await request.json();
    const parsed = createPlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { 
      name, 
      displayName, 
      description, 
      price, 
      durationDays, 
      features, 
      maxConversations, 
      maxMessagesPerDay, 
      isActive, 
      sortOrder 
    } = parsed.data;

    // Create the plan - include id since it's a primary key and required
    const newPlan = await db.insert(subscriptionPlans)
      .values({
        id: randomUUID(), // Provide the id manually since it's required
        name,
        displayName,
        description,
        price,
        durationDays,
        features: features || null, // Pass the array directly, Drizzle handles JSON serialization
        maxConversations: maxConversations ?? null,
        maxMessagesPerDay: maxMessagesPerDay ?? null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

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

// Define updatePlanSchema here
const updatePlanSchema = z.object({
  displayName: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  durationDays: z.number().positive().optional(),
  features: z.array(z.string()).optional(),
  maxConversations: z.number().nonnegative().optional(),
  maxMessagesPerDay: z.number().nonnegative().optional(),
  isActive: preprocessBoolean(), // Using the enhanced validator
  sortOrder: z.number().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requirePermission("plans:write");
    const { id } = await params;
    
    const body = await request.json();
    const parsed = updatePlanSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { 
      displayName, 
      description, 
      price, 
      durationDays, 
      features, 
      maxConversations, 
      maxMessagesPerDay, 
      isActive, 
      sortOrder 
    } = parsed.data;
    
    // Check if plan exists
    const existingPlanResult = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id));
      
    if (existingPlanResult.length === 0) {
      return NextResponse.json(
        { error: "پلن یافت نشد" },
        { status: 404 }
      );
    }
    
    // Update the plan
    const updatedPlan = await db.update(subscriptionPlans)
      .set({
        displayName,
        description,
        price,
        durationDays,
        features: features || null, // Pass the array directly, Drizzle handles JSON serialization
        maxConversations: maxConversations ?? null,
        maxMessagesPerDay: maxMessagesPerDay ?? null,
        isActive: isActive ?? null,
        sortOrder: sortOrder ?? null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionPlans.id, id))
      .returning();
    
    // Log audit
    const clientInfo = await getClientInfo();  // Changed to await
    await logAudit({
      userId: currentUser.id,
      action: "PLAN_UPDATED",
      entity: "subscription_plan",
      entityId: updatedPlan[0].id,
      metadata: { 
        planId: id,
        updatedFields: {
          displayName, 
          description, 
          price, 
          durationDays, 
          features, 
          maxConversations, 
          maxMessagesPerDay, 
          isActive, 
          sortOrder 
        }
      },
      ipAddress: clientInfo.ipAddress,  // This should now work since clientInfo is awaited
      userAgent: clientInfo.userAgent,
    });
    
    return NextResponse.json(updatedPlan[0]);
  } catch (err) {
    console.error("Admin plan update error:", err);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی پلن", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission("plans:write");
    const { id } = await params;
    const clientInfo = await getClientInfo(); // Changed to await

    // Check if plan exists
    const existingPlanResult = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id));
      
    if (existingPlanResult.length === 0) {
      return NextResponse.json(
        { error: "پلن یافت نشد" },
        { status: 404 }
      );
    }

    // Delete the plan
    await db.delete(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id));

    // Log audit
    await logAudit({
      userId: user.id,
      action: "PLAN_DELETED",
      entity: "subscription_plan",
      entityId: id,
      metadata: { planName: existingPlanResult[0].name },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json({ success: true, message: "پلن با موفقیت حذف شد" });
  } catch (err) {
    console.error("Admin plan deletion error:", err);
    return NextResponse.json(
      { error: "خطا در حذف پلن", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}
