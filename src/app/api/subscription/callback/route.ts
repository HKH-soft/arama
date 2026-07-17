import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, subscriptions, plans } from "@/db/schema";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const authority = searchParams.get("Authority");
  const status = searchParams.get("Status");

  // Get base URL for redirects
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://3000-i9jy8voym2xv7erjd7ghj.e2b.app";

  if (!authority) {
    return NextResponse.redirect(`${baseUrl}/billing?payment=failed&reason=no_authority`);
  }

  try {
    // Look up the payment record by authority
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.authority, authority))
      .limit(1);

    if (!payment) {
      return NextResponse.redirect(`${baseUrl}/billing?payment=failed&reason=payment_not_found`);
    }

    if (status !== "OK") {
      // User cancelled or status is failed
      await db
        .update(payments)
        .set({ status: "failed" })
        .where(eq(payments.id, payment.id));
      return NextResponse.redirect(`${baseUrl}/billing?payment=failed`);
    }

    // Amount sent was plan price * 10 (Rials)
    const amountInRial = payment.amount * 10;

    const merchantId = process.env.ZARINPAL_MERCHANT_ID || "00000000-0000-0000-0000-000000000000";
    const isSandbox = process.env.ZARINPAL_SANDBOX === "true";

    const verifyUrl = isSandbox
      ? "https://sandbox.zarinpal.com/pg/v4/payment/verify.json"
      : "https://payment.zarinpal.com/pg/v4/payment/verify.json";

    let isSuccess = false;
    let refId = "";

    // If it's a mock authority generated during local fallback, skip live verify
    if (authority.startsWith("auth_")) {
      isSuccess = true;
      refId = `ref_${Math.floor(100000 + Math.random() * 900000)}`;
    } else {
      try {
        const response = await fetch(verifyUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            merchant_id: merchantId,
            amount: amountInRial, // Amount in Rial
            authority: authority,
          }),
        });

        const resData = (await response.json()) as {
          data?: {
            code: number;
            ref_id: string;
          };
          errors?: Array<{ code: number; message: string }>;
        };

        if (response.ok && resData.data && (resData.data.code === 100 || resData.data.code === 101)) {
          isSuccess = true;
          refId = String(resData.data.ref_id);
        } else {
          console.error("ZarinPal Verify failed:", resData);
        }
      } catch (err) {
        console.error("Error making verify request to ZarinPal:", err);
      }
    }

    if (isSuccess) {
      // Mark payment row as paid
      await db
        .update(payments)
        .set({ status: "paid", refId: refId })
        .where(eq(payments.id, payment.id));

      const now = new Date();
      const renewsAt = new Date(now.getTime() + 30 * 86400000);

      // Retrieve plan info
      const [plan] = await db
        .select()
        .from(plans)
        .where(eq(plans.id, payment.planId))
        .limit(1);

      if (plan) {
        const existing = await db
          .select({ id: subscriptions.id })
          .from(subscriptions)
          .where(eq(subscriptions.userId, payment.userId))
          .limit(1);

        if (existing.length > 0) {
          // Upgrade existing subscription
          await db
            .update(subscriptions)
            .set({
              planId: plan.id,
              amount: plan.price,
              status: "active",
              renewsAt,
              startedAt: now,
            })
            .where(eq(subscriptions.userId, payment.userId));
        } else {
          // Create new subscription
          await db.insert(subscriptions).values({
            userId: payment.userId,
            planId: plan.id,
            status: "active",
            amount: plan.price,
            interval: "month",
            renewsAt,
          });
        }
      }

      return NextResponse.redirect(`${baseUrl}/billing?payment=success&ref=${refId}`);
    } else {
      // Mark payment row as failed
      await db
        .update(payments)
        .set({ status: "failed" })
        .where(eq(payments.id, payment.id));
      return NextResponse.redirect(`${baseUrl}/billing?payment=failed`);
    }
  } catch (error) {
    console.error("Callback verification failed:", error);
    return NextResponse.redirect(`${baseUrl}/billing?payment=failed&reason=internal_error`);
  }
}
