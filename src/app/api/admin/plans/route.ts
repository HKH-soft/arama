import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/prisma"; // Updated to use Drizzle
import { 
  subscriptionPlans
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc, sql } from 'drizzle-orm'; // Import Drizzle operators
import { z } from "zod";
import { randomUUID } from 'crypto';

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
    
    const [plans, total] = await Promise.all([
      db.select()
        .from(subscriptionPlans)
        .where(whereClause)
        .orderBy(sortOrder === "asc" ? asc(subscriptionPlans[sortBy]) : desc(subscriptionPlans[sortBy]))
        .offset(skip)
        .limit(limit),
      db.select({ count: sql<number>`count(*)::int` })
        .from(subscriptionPlans)
        .where(whereClause)
    ]);
    
    return NextResponse.json({
      data: plans,
      pagination: {
        total: total[0].count,
        page,
        limit,
        totalPages: Math.ceil(total[0].count / limit),
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
  name: z.string().min(1, "نام الزامی است").max(100),
  displayName: z.string().min(1, "عنوان نمایشی الزامی است").max(100),
  description: z.string().max(500).optional(),
  price: z.number().nonnegative("قیمت نباید منفی باشد"),
  durationDays: z.number().positive("مدت زمان باید مثبت باشد"),
  features: z.array(z.string()).nonempty("ویژگی‌ها الزامی است").optional(),
  maxConversations: z.number().nonnegative().optional(),
  maxMessagesPerDay: z.number().nonnegative().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requirePermission("plans:write");
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
    
    // Check if plan name already exists
    const existingPlanResult = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.name, name));
      
    if (existingPlanResult.length > 0) {
      return NextResponse.json(
        { error: "پلن با این نام از قبل وجود دارد" },
        { status: 409 }
      );
    }
    
    // Create plan
    const planResult = await db.insert(subscriptionPlans).values({
      id: randomUUID(),
      name,
      displayName,
      description: description || null,
      price,
      durationDays,
      features: features || null, // Store as array, Drizzle will convert to JSON
      maxConversations: maxConversations || null,
      maxMessagesPerDay: maxMessagesPerDay || null,
      isActive,
      sortOrder,
    }).returning();
    
    return NextResponse.json(planResult[0]);
  } catch (err) {
    console.error("Admin plan creation error:", err);
    return NextResponse.json(
      { error: "خطا در ایجاد پلن", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}
