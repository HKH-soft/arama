import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const authority = url.searchParams.get("Authority");
  const status = url.searchParams.get("Status");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!authority || !status) {
    return NextResponse.redirect(`${baseUrl}/dashboard/billing?status=error`);
  }

  try {
    // Find payment record
    const [payment] = await db.select().from(payments).where(eq(payments.authority, authority)).limit(1);
    
    if (!payment) {
      return NextResponse.redirect(`${baseUrl}/dashboard/billing?status=error`);
    }

    if (payment.status === "paid") {
      // Already verified
      return NextResponse.redirect(`${baseUrl}/dashboard/billing?status=success`);
    }

    if (status !== "OK") {
      // Payment was canceled or failed
      await db.update(payments).set({ status: "failed" }).where(eq(payments.id, payment.id));
      return NextResponse.redirect(`${baseUrl}/dashboard/billing?status=canceled`);
    }

    const merchantId = process.env.ZARINPAL_MERCHANT_ID || "00000000-0000-0000-0000-000000000000";
    const isSandbox = process.env.ZARINPAL_SANDBOX === "true";
    const verifyApiUrl = isSandbox 
      ? "https://sandbox.zarinpal.com/pg/v4/payment/verify.json" 
      : "https://api.zarinpal.com/pg/v4/payment/verify.json";

    // Verify payment with ZarinPal
    const zpReq = await fetch(verifyApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: payment.amount * 10, // Rials
        authority: authority
      })
    });

    const zpRes = await zpReq.json();

    if (zpRes.data && (zpRes.data.code === 100 || zpRes.data.code === 101)) {
      // Payment successful
      await db.update(payments).set({ 
        status: "paid",
        refId: zpRes.data.ref_id.toString() 
      }).where(eq(payments.id, payment.id));

      // Check for existing active subscription
      const [existingSub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, payment.userId)).limit(1);

      const renewsAt = new Date();
      renewsAt.setMonth(renewsAt.getMonth() + 1); // Basic logic: 1 month duration

      if (existingSub) {
        await db.update(subscriptions).set({
          planId: payment.planId,
          status: "active",
          renewsAt,
        }).where(eq(subscriptions.id, existingSub.id));
      } else {
        await db.insert(subscriptions).values({
          userId: payment.userId,
          planId: payment.planId,
          status: "active",
          amount: payment.amount,
          interval: "month",
          renewsAt
        });
      }

      return NextResponse.redirect(`${baseUrl}/dashboard/billing?status=success`);
    } else {
      await db.update(payments).set({ status: "failed" }).where(eq(payments.id, payment.id));
      return NextResponse.redirect(`${baseUrl}/dashboard/billing?status=error`);
    }

  } catch (error) {
    console.error("[Payment Verify]", error);
    return NextResponse.redirect(`${baseUrl}/dashboard/billing?status=error`);
  }
}
