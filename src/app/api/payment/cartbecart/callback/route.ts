import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, subscriptions } from "@/db/schema";
import { inquireCartBeCartOrder } from "@/lib/cartbecart";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const paymentId = url.searchParams.get("paymentId");
    const orderId = url.searchParams.get("order_id") || url.searchParams.get("orderId");
    const token = url.searchParams.get("token") || url.searchParams.get("payment_token");

    const host = request.headers.get("host");
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (host ? `${forwardedProto || "https"}://${host}` : "https://arama.life");

    if (!paymentId && !orderId) {
      return NextResponse.redirect(`${baseUrl}/billing?status=error&message=missing_id`);
    }

    const [paymentRecord] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId || orderId!))
      .limit(1);

    if (!paymentRecord) {
      return NextResponse.redirect(`${baseUrl}/billing?status=error&message=not_found`);
    }

    if (paymentRecord.status === "paid") {
      return NextResponse.redirect(`${baseUrl}/billing?status=success`);
    }

    // Inquire with CartBeCart
    const queryToken = token || paymentRecord.authority;
    const cbcStatus = await inquireCartBeCartOrder(queryToken);

    if (cbcStatus && cbcStatus.status === "paid") {
      const refId = String(cbcStatus.order_code || cbcStatus.order_id);
      await db
        .update(payments)
        .set({ status: "paid", refId })
        .where(eq(payments.id, paymentRecord.id));

      const days = paymentRecord.planId === "1-year" ? 365 : paymentRecord.planId === "3-month" ? 90 : 30;
      const now = new Date();
      const renewsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      await db.insert(subscriptions).values({
        userId: paymentRecord.userId,
        planId: paymentRecord.planId,
        amount: paymentRecord.amount,
        status: "active",
        interval: paymentRecord.planId === "1-year" ? "yearly" : paymentRecord.planId === "3-month" ? "quarterly" : "monthly",
        startedAt: now,
        renewsAt,
      });

      return NextResponse.redirect(`${baseUrl}/billing?status=success`);
    }

    return NextResponse.redirect(`${baseUrl}/billing?status=failed`);
  } catch (error) {
    console.error("[CartBeCart Callback Error]:", error);
    const host = request.headers.get("host");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (host ? `https://${host}` : "https://arama.life");
    return NextResponse.redirect(`${baseUrl}/billing?status=error`);
  }
}