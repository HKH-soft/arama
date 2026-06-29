import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/services/payment";

export async function GET(request: NextRequest) {
  try {
    const authority = request.nextUrl.searchParams.get("Authority");
    const status = request.nextUrl.searchParams.get("Status");
    const paymentId = request.nextUrl.searchParams.get("paymentId");
    const gateway = request.nextUrl.searchParams.get("gateway") || "zarinpal";

    if (!authority || !paymentId) {
      return NextResponse.redirect(
        new URL("/payment/failed?error=invalid_params", request.url)
      );
    }

    if (status !== "OK") {
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
      return NextResponse.redirect(
        new URL("/payment/success", request.url)
      );
    } else {
      return NextResponse.redirect(
        new URL(`/payment/failed?error=${encodeURIComponent(result.message)}`, request.url)
      );
    }
  } catch (err) {
    console.error("Payment callback error:", err);
    return NextResponse.redirect(
      new URL("/payment/failed?error=server_error", request.url)
    );
  }
}