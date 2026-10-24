import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, subscriptions } from "@/db/schema";
import { inquireCartBeCartOrder } from "@/lib/cartbecart";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const authority = url.searchParams.get("Authority") || url.searchParams.get("token") || url.searchParams.get("paymentId");
  const status = url.searchParams.get("Status") || url.searchParams.get("status");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || url.origin || "https://arama.life";

  if (!authority) {
    return NextResponse.redirect(`${baseUrl}/billing?status=error`);
  }

  try {
    // Find payment record
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.authority, authority))
      .limit(1);

    if (!payment) {
      return NextResponse.redirect(`${baseUrl}/billing?status=error`);
    }

    if (payment.status === "paid") {
      return NextResponse.redirect(`${baseUrl}/billing?status=success`);
    }

    let isSuccess = false;
    let refId = `ARM_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Check with CartBeCart
    try {
      const cbcStatus = await inquireCartBeCartOrder(authority);
      if (cbcStatus && cbcStatus.status === "paid") {
        isSuccess = true;
        refId = String(cbcStatus.order_code || cbcStatus.order_id);
      }
    } catch (cbcErr) {
      console.warn("[Payment Verify] CartBeCart inquiry:", cbcErr);
    }

    if (status === "OK" || status === "success") {
      isSuccess = true;
    }

    if (isSuccess) {
      await db
        .update(payments)
        .set({ status: "paid", refId })
        .where(eq(payments.id, payment.id));

      const days = payment.planId === "1-year" ? 365 : payment.planId === "3-month" ? 90 : 30;
      const now = new Date();
      const renewsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      await db.insert(subscriptions).values({
        userId: payment.userId,
        planId: payment.planId,
        amount: payment.amount,
        status: "active",
        interval: payment.planId === "1-year" ? "yearly" : payment.planId === "3-month" ? "quarterly" : "monthly",
        startedAt: now,
        renewsAt,
      });

      return NextResponse.redirect(`${baseUrl}/billing?status=success&ref=${refId}`);
    } else {
      await db.update(payments).set({ status: "failed" }).where(eq(payments.id, payment.id));
      return NextResponse.redirect(`${baseUrl}/billing?status=canceled`);
    }
  } catch (error) {
    console.error("[Payment Verify]", error);
    return NextResponse.redirect(`${baseUrl}/billing?status=error`);
  }
}
