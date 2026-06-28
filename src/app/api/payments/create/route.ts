import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { 
  subscriptionPlans,
  payments,
  subscriptions
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc } from 'drizzle-orm'; // Import Drizzle operators
import { PaymentService } from "@/lib/services/payment/payment";
import { z } from "zod";
import { randomUUID } from 'crypto';

const createPaymentSchema = z.object({
  planId: z.string().min(1, "شناسه پلن الزامی است"),
  returnUrl: z.string().url("آدرس بازگشت نامعتبر است"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    const body = await request.json();
    const parsed = createPaymentSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { planId, returnUrl } = parsed.data;
    
    // Verify plan exists and is active
    const planResult = await db.select()
      .from(subscriptionPlans)
      .where(and(
        eq(subscriptionPlans.id, planId),
        eq(subscriptionPlans.isActive, true)
      ));
    
    const plan = planResult[0];
    if (!plan) {
      return NextResponse.json(
        { error: "پلن یافت نشد یا غیرفعال است" },
        { status: 404 }
      );
    }

    // Create a subscription record first (pending until payment is confirmed)
    const subscriptionResult = await db.insert(subscriptions).values({
      id: randomUUID(),
      userId: user.id,
      planId: plan.id,
      status: "PENDING",
      startDate: new Date(),
      endDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000), // Use plan duration
    }).returning();

    // Create payment record
    const paymentResult = await db.insert(payments).values({
      id: randomUUID(),
      userId: user.id,
      subscriptionId: subscriptionResult[0].id,
      amount: plan.price,
      currency: "USD", // TODO: Make configurable
      status: "PENDING",
      gatewayName: "stripe", // Default to stripe
      description: `Payment for ${plan.displayName} plan`,
      callbackUrl: returnUrl,
    }).returning();

    // Create payment session
    const paymentData = await PaymentService.createPaymentSession(
      user.id,
      plan.id,
      returnUrl
    );

    return NextResponse.json({
      paymentId: paymentData.paymentId,
      sessionId: paymentData.sessionId,
      url: paymentData.url,
    });
  } catch (err) {
    console.error("Create payment error:", err);
    return NextResponse.json(
      { error: "خطا در ایجاد پرداخت", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}