import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { 
  subscriptionPlans,
  subscriptions
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc, sql } from 'drizzle-orm'; // Import Drizzle operators
import { logAudit, getClientInfo } from "@/lib/audit";
import { z } from "zod";

const updatePlanSchema = z.object({
  displayName: z.string().min(1, "عنوان نمایشی الزامی است").max(100).optional(),
  description: z.string().max(500).optional(),
  price: z.number().nonnegative("قیمت نباید منفی باشد").optional(),
  durationDays: z.number().positive("مدت زمان باید مثبت باشد").optional(),
  features: z.array(z.string()).optional(),
  maxConversations: z.number().nonnegative().optional(),
  maxMessagesPerDay: z.number().nonnegative().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission("plans:read");
    const { id } = await params;

    const planResult = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id));
      
    if (planResult.length === 0) {
      return NextResponse.json(
        { error: "پلن یافت نشد" },
        { status: 404 }
      );
    }
    
    const plan = planResult[0];
    
    // Parse features from JSON string
    try {
      plan.features = JSON.parse(plan.features as unknown as string);
    } catch {
      plan.features = [];
    }
    
    return NextResponse.json(plan);
  } catch (err) {
    console.error("Admin plan fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت پلن", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}

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
    
    // Update plan
    const updatedPlanResult = await db.update(subscriptionPlans)
      .set({
        displayName: displayName || existingPlanResult[0].displayName,
        description: description || existingPlanResult[0].description,
        price: price !== undefined ? price : existingPlanResult[0].price,
        durationDays: durationDays !== undefined ? durationDays : existingPlanResult[0].durationDays,
        features: features !== undefined ? features : existingPlanResult[0].features,
        maxConversations: maxConversations !== undefined ? maxConversations : existingPlanResult[0].maxConversations,
        maxMessagesPerDay: maxMessagesPerDay !== undefined ? maxMessagesPerDay : existingPlanResult[0].maxMessagesPerDay,
        isActive: isActive !== undefined ? isActive : existingPlanResult[0].isActive,
        sortOrder: sortOrder !== undefined ? sortOrder : existingPlanResult[0].sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionPlans.id, id))
      .returning();
    
    const updatedPlan = updatedPlanResult[0];
    
    // Parse features from JSON string
    try {
      updatedPlan.features = JSON.parse(updatedPlan.features as unknown as string);
    } catch {
      updatedPlan.features = [];
    }
    
    return NextResponse.json(updatedPlan);
  } catch (err) {
    console.error("Admin plan update error:", err);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی پلن", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requirePermission("plans:write");
    const { id } = await params;

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
    
    // Don't allow deletion of built-in plans
    if (["FREE", "PREMIUM", "ENTERPRISE"].includes(existingPlanResult[0].name)) {
      return NextResponse.json(
        { error: "حذف پلن‌های داخلی مجاز نیست" },
        { status: 400 }
      );
    }
    
    // Check if there are active subscriptions using this plan
    const subscriptionCheckResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(subscriptions)
      .where(eq(subscriptions.planId, id));
      
    const subscriptionCheck = subscriptionCheckResult[0];
    
    if (subscriptionCheck.count > 0) {
      return NextResponse.json(
        { error: "امکان حذف پلن دارای اشتراک وجود ندارد" },
        { status: 400 }
      );
    }
    
    // Delete the plan
    await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    
    return NextResponse.json({ message: "پلن با موفقیت حذف شد" });
  } catch (err) {
    console.error("Admin plan deletion error:", err);
    return NextResponse.json(
      { error: "خطا در حذف پلن", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}