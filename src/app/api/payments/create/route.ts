import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { PaymentService } from "@/lib/services/payment";
import { z } from "zod";

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

    // Create payment session with Iranian gateway
    const paymentData = await PaymentService.createPaymentSession(
      user.id,
      planId,
      "zarinpal",
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