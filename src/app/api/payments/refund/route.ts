import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { PaymentService } from "@/lib/services/payment";
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

    const payment = await PaymentService.getPayment(paymentId);

    if (!payment) {
      return NextResponse.json(
        { error: "پرداخت یافت نشد" },
        { status: 404 }
      );
    }

    if (payment.userId !== user.id) {
      return NextResponse.json(
        { error: "شما اجازه دسترسی به این پرداخت را ندارید" },
        { status: 403 }
      );
    }

    if (payment.status !== "SUCCESS") {
      return NextResponse.json(
        { error: "فقط پرداخت‌های موفق می‌توانند مسترد شوند" },
        { status: 400 }
      );
    }

    // Update payment status to refunded
    const updatedPayment = await PaymentService.refundPayment(paymentId);

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

    return NextResponse.json(updatedPayment);
  } catch (err) {
    console.error("Refund payment error:", err);
    return NextResponse.json(
      { error: "خطا در استرداد وجه", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}