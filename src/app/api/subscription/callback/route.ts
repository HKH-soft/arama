import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, subscriptions, plans } from "@/db/schema";
import { inquireCartBeCartOrder } from "@/lib/cartbecart";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const authority = searchParams.get("Authority") || searchParams.get("token") || searchParams.get("paymentId");
  const status = searchParams.get("Status") || searchParams.get("status");

  // Get base URL for redirects
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin || "https://arama.life";

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

    if (payment.status === "paid") {
      return NextResponse.redirect(`${baseUrl}/billing?status=success`);
    }

    let isSuccess = false;
    let refId = `ARM_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Inquire with CartBeCart
    try {
      const cbcStatus = await inquireCartBeCartOrder(authority);
      if (cbcStatus && cbcStatus.status === "paid") {
        isSuccess = true;
        refId = String(cbcStatus.order_code || cbcStatus.order_id);
      }
    } catch (cbcErr) {
      console.warn("[Subscription Callback] CartBeCart inquiry error:", cbcErr);
    }

    if (status === "OK" || status === "success") {
      isSuccess = true;
    }

    if (isSuccess) {
      // Mark payment row as paid
      await db
        .update(payments)
        .set({ status: "paid", refId: refId })
        .where(eq(payments.id, payment.id));

      const days = payment.planId === "1-year" ? 365 : payment.planId === "3-month" ? 90 : 30;
      const now = new Date();
      const renewsAt = new Date(now.getTime() + days * 86400000);

      const [existingSub] = await db
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(eq(subscriptions.userId, payment.userId))
        .limit(1);

      if (existingSub) {
        await db
          .update(subscriptions)
          .set({
            planId: payment.planId,
            amount: payment.amount,
            status: "active",
            renewsAt,
            startedAt: now,
          })
          .where(eq(subscriptions.userId, payment.userId));
      } else {
        await db.insert(subscriptions).values({
          userId: payment.userId,
          planId: payment.planId,
          amount: payment.amount,
          status: "active",
          interval: payment.planId === "1-year" ? "yearly" : payment.planId === "3-month" ? "quarterly" : "monthly",
          startedAt: now,
          renewsAt,
        });
      }

      return NextResponse.redirect(`${baseUrl}/billing?status=success&ref=${refId}`);
    } else {
      await db
        .update(payments)
        .set({ status: "failed" })
        .where(eq(payments.id, payment.id));
      return NextResponse.redirect(`${baseUrl}/billing?status=canceled`);
    }
  } catch (error) {
    console.error("Callback verification failed:", error);
    return NextResponse.redirect(`${baseUrl}/billing?payment=failed&reason=internal_error`);
  }
}
