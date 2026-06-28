import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { 
  payments,
  subscriptions
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc } from 'drizzle-orm'; // Import Drizzle operators
import { logAudit, getClientInfo } from "@/lib/audit";
import { z } from "zod";

const refundSchema = z.object({
  paymentId: z.string().min(1, "شناسه پرداخت الزامی است"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const clientInfo = getClientInfo(request);
    
    const body = await request.json();
    const parsed = refundSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { paymentId } = parsed.data;
    
    // Check if payment exists and belongs to user
    const paymentResult = await db.select()
      .from(payments)
      .where(and(
        eq(payments.id, paymentId),
        eq(payments.userId, user.id)
      ));
      
    const payment = paymentResult[0];
    
    if (!payment) {
      return NextResponse.json(
        { error: "پرداخت یافت نشد یا متعلق به شما نیست" },
        { status: 404 }
      );
    }
    
    if (payment.status !== "SUCCESS") {
      return NextResponse.json(
        { error: "فقط پرداخت‌های موفق می‌توانند مسترد شوند" },
        { status: 400 }
      );
    }
    
    // Update payment status to refunded
    const updatedPaymentResult = await db.update(payments)
      .set({
        status: "REFUNDED",
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId))
      .returning();
    
    // Cancel related subscription if exists
    if (payment.subscriptionId) {
      await db.update(subscriptions)
        .set({
          status: "CANCELED",
          cancelledAt: new Date(),
        })
        .where(eq(subscriptions.id, payment.subscriptionId));
    }
    
    // Log audit
    await logAudit({
      userId: user.id,
      action: "PAYMENT_REFUNDED",
      entity: "payment",
      entityId: paymentId,
      metadata: { originalAmount: payment.amount },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });
    
    return NextResponse.json(updatedPaymentResult[0]);
  } catch (err) {
    console.error("Refund payment error:", err);
    return NextResponse.json(
      { error: "خطا در استرداد وجه", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}