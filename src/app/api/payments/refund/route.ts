import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { PaymentService } from "@/lib/services/payment";
import { logAudit, getClientInfo } from "@/lib/audit";
import { z } from "zod";
import db from "@/lib/db";
import { payments, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

const refundSchema = z.object({
  paymentId: z.string().min(1, "شناسه پرداخت الزامی است"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const parsed = refundSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { paymentId } = parsed.data;

    // Get original payment for audit
    const originalPaymentResult = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId));

    if (originalPaymentResult.length === 0) {
      return NextResponse.json(
        { error: "پرداخت یافت نشد" },
        { status: 404 }
      );
    }

    const originalPayment = originalPaymentResult[0];

    if (originalPayment.userId !== user.id) {
      return NextResponse.json(
        { error: "شما اجازه دسترسی به این پرداخت را ندارید" },
        { status: 403 }
      );
    }

    if (originalPayment.status !== "SUCCESS") {
      return NextResponse.json(
        { error: "فقط پرداخت‌های موفق می‌توانند مسترد شوند" },
        { status: 400 }
      );
    }

    // Update payment status to refunded
    const updatedPayment = await db
      .update(payments)
      .set({ 
        status: "REFUNDED", 
        updatedAt: new Date() 
      })
      .where(eq(payments.id, paymentId))
      .returning();

    // Update associated subscription if exists
    if (originalPayment.subscriptionId) {
      await db
        .update(subscriptions)
        .set({ 
          status: "CANCELED", 
          cancelledAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(subscriptions.id, originalPayment.subscriptionId));
    }

    const clientInfo = await getClientInfo();  // Changed to await
    
    // Log audit
    await logAudit({
      userId: user.id,
      action: "PAYMENT_REFUNDED",
      entity: "payment",
      entityId: paymentId,
      metadata: {
        originalAmount: originalPayment.amount,
        currency: originalPayment.currency,
        gatewayName: originalPayment.gatewayName,
        subscriptionId: originalPayment.subscriptionId,
      },
      ipAddress: clientInfo.ipAddress,  // This should now work since clientInfo is awaited
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json({
      success: true,
      payment: updatedPayment[0],
      message: "بازپرداخت با موفقیت انجام شد"
    });
  } catch (err) {
    console.error("Payment refund error:", err);
    return NextResponse.json(
      { error: "خطا در انجام بازپرداخت", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}
