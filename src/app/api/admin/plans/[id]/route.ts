import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { subscriptionPlans, subscriptions } from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc, sql } from "drizzle-orm"; // Import Drizzle operators
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requirePermission("plans:read");
    const { id } = await params;

    const planResult = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id));

    if (planResult.length === 0) {
      return NextResponse.json({ error: "پلن یافت نشد" }, { status: 404 });
    }

    const plan = planResult[0];

    // Parse features from JSON string if it exists
    if (plan.features && typeof plan.features === "string") {
      try {
        plan.features = JSON.parse(plan.features);
      } catch {
        plan.features = [];
      }
    } else if (plan.features === null) {
      plan.features = [];
    }

    return NextResponse.json(plan);
  } catch (err) {
    console.error("Admin plan fetch error:", err);
    return NextResponse.json(
      {
        error: "خطا در دریافت پلن",
        details: err instanceof Error ? err.message : "خطای ناشناخته",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await requirePermission("plans:write");
    const { id } = await params;
    const clientInfo = await getClientInfo(); // Changed to await

    const body = await request.json();
    const parsed = updatePlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 },
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
      sortOrder,
    } = parsed.data;

    // Check if plan exists
    const existingPlanResult = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id));

    if (existingPlanResult.length === 0) {
      return NextResponse.json({ error: "پلن یافت نشد" }, { status: 404 });
    }

    // Prepare the update object with only the fields that are provided
    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (durationDays !== undefined) updateData.durationDays = durationDays;
    if (features !== undefined) updateData.features = features;
    if (maxConversations !== undefined)
      updateData.maxConversations = maxConversations;
    if (maxMessagesPerDay !== undefined)
      updateData.maxMessagesPerDay = maxMessagesPerDay;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    updateData.updatedAt = new Date();

    // Update plan
    const updatedPlanResult = await db
      .update(subscriptionPlans)
      .set(updateData)
      .where(eq(subscriptionPlans.id, id))
      .returning();

    const updatedPlan = updatedPlanResult[0];

    // Parse features from JSON string if it exists
    if (updatedPlan.features && typeof updatedPlan.features === "string") {
      try {
        updatedPlan.features = JSON.parse(updatedPlan.features);
      } catch {
        updatedPlan.features = [];
      }
    } else if (updatedPlan.features === null) {
      updatedPlan.features = [];
    }

    // Log audit
    await logAudit({
      userId: currentUser.id,
      action: "PLAN_UPDATED",
      entity: "subscription_plan",
      entityId: updatedPlan.id,
      metadata: {
        planId: id,
        updatedFields: Object.keys(parsed.data),
      },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json(updatedPlan);
  } catch (err) {
    console.error("Admin plan update error:", err);
    return NextResponse.json(
      {
        error: "خطا در به‌روزرسانی پلن",
        details: err instanceof Error ? err.message : "خطای ناشناخته",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await requirePermission("plans:write");
    const { id } = await params;
    const clientInfo = await getClientInfo(); // Changed to await

    // Check if plan exists
    const existingPlanResult = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id));

    if (existingPlanResult.length === 0) {
      return NextResponse.json({ error: "پلن یافت نشد" }, { status: 404 });
    }

    // Don't allow deletion of built-in plans
    if (
      ["FREE", "PREMIUM", "ENTERPRISE"].includes(
        existingPlanResult[0].name.toUpperCase(),
      )
    ) {
      return NextResponse.json(
        { error: "حذف پلن‌های داخلی مجاز نیست" },
        { status: 400 },
      );
    }

    // Check if there are active subscriptions using this plan
    const subscriptionCheckResult = await db
      .select({ count: sql<number>`CAST(count(*) AS INTEGER)` })
      .from(subscriptions)
      .where(eq(subscriptions.planId, id));

    const subscriptionCheck = subscriptionCheckResult[0];

    if (subscriptionCheck.count > 0) {
      return NextResponse.json(
        { error: "امکان حذف پلن دارای اشتراک وجود ندارد" },
        { status: 400 },
      );
    }

    // Delete the plan
    await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));

    // Log audit
    await logAudit({
      userId: currentUser.id,
      action: "PLAN_DELETED",
      entity: "subscription_plan",
      entityId: id,
      metadata: { planName: existingPlanResult[0].name },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json({ message: "پلن با موفقیت حذف شد" });
  } catch (err) {
    console.error("Admin plan deletion error:", err);
    return NextResponse.json(
      {
        error: "خطا در حذف پلن",
        details: err instanceof Error ? err.message : "خطای ناشناخته",
      },
      { status: 500 },
    );
  }
}
