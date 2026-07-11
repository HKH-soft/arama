import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { PaymentService } from "@/lib/services/payment";
import { z } from "zod";
import { logAudit, getClientInfo } from "@/lib/audit";

const createPaymentSchema = z.object({
  planId: z.string().min(1, "شناسه پلن الزامی است"),
  returnUrl: z.string().url("آدرس بازگشت نامعتبر است"),
  clientRequestId: z.string().optional(), // Add idempotency key
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const clientInfo = await getClientInfo(request);

    const body = await request.json();
    const parsed = createPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
    }

    const { planId, returnUrl, clientRequestId } = parsed.data;

    // Create payment session with Iranian gateway
    const paymentData = await PaymentService.createPaymentSession(
      user.id,
      planId,
      "zarinpal",
      returnUrl,
      clientRequestId, // Pass idempotency key
    );

    await logAudit({
      userId: user.id,
      action: "PAYMENT_CREATED",
      entity: "payment",
      entityId: paymentData.paymentId,
      metadata: { planId, gateway: "zarinpal" },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json({
      paymentId: paymentData.paymentId,
      sessionId: paymentData.sessionId,
      url: paymentData.url,
    });
  } catch (err) {
    console.error("Create payment error:", err);
    return NextResponse.json({ error: "خطا در ایجاد پرداخت" }, { status: 500 });
  }
}
