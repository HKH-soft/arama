import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/services/payment";
import { logAudit } from "@/lib/audit";
import db from "@/lib/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authority = request.nextUrl.searchParams.get("Authority");
    const status = request.nextUrl.searchParams.get("Status");
    const paymentId = request.nextUrl.searchParams.get("paymentId");
    const gateway = request.nextUrl.searchParams.get("gateway") || "zarinpal";

    // Validate required parameters
    if (!authority || !paymentId) {
      await logAudit({
        action: "PAYMENT_CALLBACK_MISSING_PARAMS",
        metadata: { authority, paymentId, gateway },
      });
      return NextResponse.redirect(
        new URL("/payment/failed?error=invalid_params", request.url)
      );
    }

    // Validate gateway parameter
    if (!["zarinpal", "payping"].includes(gateway)) {
      await logAudit({
        action: "PAYMENT_CALLBACK_INVALID_GATEWAY",
        metadata: { gateway, paymentId },
      });
      return NextResponse.redirect(
        new URL("/payment/failed?error=invalid_gateway", request.url)
      );
    }

    // Verify that the payment exists and belongs to a valid state for processing
    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId));

    if (payment.length === 0) {
      await logAudit({
        action: "PAYMENT_CALLBACK_PAYMENT_NOT_FOUND",
        metadata: { paymentId },
      });
      return NextResponse.redirect(
        new URL("/payment/failed?error=payment_not_found", request.url)
      );
    }

    // Prevent processing if payment is already completed
    if (["SUCCESS", "FAILED", "REFUNDED"].includes(payment[0].status.toUpperCase())) {
      await logAudit({
        action: "PAYMENT_CALLBACK_ALREADY_PROCESSED",
        entity: "payment",
        entityId: paymentId,
        metadata: { 
          paymentId, 
          currentStatus: payment[0].status,
          receivedStatus: status
        },
      });
      return NextResponse.redirect(
        new URL("/payment/already_processed", request.url)
      );
    }

    if (status !== "OK") {
      await logAudit({
        action: "PAYMENT_CALLBACK_CANCELLED_BY_USER",
        entity: "payment",
        entityId: paymentId,
        metadata: { paymentId, authority, status },
      });
      return NextResponse.redirect(
        new URL("/payment/failed?error=payment_cancelled", request.url)
      );
    }

    // Verify payment with the gateway
    const result = await PaymentService.verifyPayment(
      paymentId,
      authority,
      gateway as any
    );

    if (result.success) {
      await logAudit({
        userId: payment[0].userId,
        action: "PAYMENT_CALLBACK_VERIFIED_SUCCESS",
        entity: "payment",
        entityId: paymentId,
        metadata: { 
          paymentId, 
          authority, 
          gateway,
          refId: result.refId
        },
      });
      
      return NextResponse.redirect(
        new URL("/payment/success", request.url)
      );
    } else {
      await logAudit({
        userId: payment[0].userId,
        action: "PAYMENT_CALLBACK_VERIFICATION_FAILED",
        entity: "payment",
        entityId: paymentId,
        metadata: { 
          paymentId, 
          authority, 
          gateway, 
          message: result.message 
        },
      });
      return NextResponse.redirect(
        new URL(`/payment/failed?error=${encodeURIComponent(result.message)}`, request.url)
      );
    }
  } catch (err) {
    console.error("Payment callback error:", err);
    await logAudit({
      action: "PAYMENT_CALLBACK_ERROR",
      metadata: { 
        error: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined
      },
    });
    return NextResponse.redirect(
      new URL("/payment/failed?error=server_error", request.url)
    );
  }
}