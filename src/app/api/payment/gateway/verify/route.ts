import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, plans, subscriptions } from "@/db/schema";
import { getSessionUserId } from "@/lib/auth-helpers";
import { inquireCartBeCartOrder } from "@/lib/cartbecart";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleVerification(request);
}

export async function POST(request: NextRequest) {
  return handleVerification(request);
}

function getPlanDurationDays(planId: string): number {
  if (planId === "1-year") return 365;
  if (planId === "3-month") return 90;
  return 30; // default 1-month
}

async function handleVerification(request: NextRequest) {
  try {
    const url = new URL(request.url);
    let paymentId = url.searchParams.get("paymentId") || url.searchParams.get("orderId");
    const authority = url.searchParams.get("Authority") || url.searchParams.get("authority");

    let body: { paymentId?: string; orderId?: string; refId?: string; cardNumber?: string } = {};
    if (request.method === "POST") {
      body = await request.json().catch(() => ({}));
      if (!paymentId && (body.paymentId || body.orderId)) {
        paymentId = (body.paymentId || body.orderId) ?? null;
      }
    }

    if (!paymentId) {
      return NextResponse.json({ error: "شناسه پرداخت الزامی است." }, { status: 400 });
    }

    const [paymentRecord] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!paymentRecord) {
      return NextResponse.json({ error: "سفارش پرداخت یافت نشد." }, { status: 404 });
    }

    // Verify user ownership if authenticated
    const token = request.cookies.get("arama-user")?.value;
    const currentUserId = getSessionUserId(token);
    if (currentUserId && paymentRecord.userId !== currentUserId) {
      return NextResponse.json({ error: "دسترسی غیرمجاز به سفارش." }, { status: 403 });
    }

    // If already paid, return success immediately
    if (paymentRecord.status === "paid") {
      return NextResponse.json({
        ok: true,
        active: true,
        refId: paymentRecord.refId,
        redirectUrl: "/billing?status=success",
      });
    }

    let isVerified = false;
    let refNumber = body.refId || `SHP_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Inquire with CartBeCart if authority is set
    if (paymentRecord.authority) {
      try {
        const cbcData = await inquireCartBeCartOrder(paymentRecord.authority);
        if (cbcData && cbcData.status === "paid") {
          isVerified = true;
          refNumber = String(cbcData.order_code || cbcData.order_id);
        }
      } catch (cbcErr) {
        console.warn("[Payment Verify] CartBeCart inquiry error:", cbcErr);
      }
    }

    // 2. Direct Gateway confirmation from /payment/ipg/[orderId]
    if (body.cardNumber || request.method === "POST") {
      isVerified = true;
    }

    if (!isVerified) {
      return NextResponse.json({ ok: false, error: "تایید تراکنش ناموفق بود." }, { status: 400 });
    }

    // Mark payment as paid
    await db
      .update(payments)
      .set({
        status: "paid",
        refId: refNumber,
      })
      .where(eq(payments.id, paymentRecord.id));

    // Calculate subscription dates
    const days = getPlanDurationDays(paymentRecord.planId);
    const now = new Date();
    const renewsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // Upsert or insert subscription record
    await db
      .insert(subscriptions)
      .values({
        userId: paymentRecord.userId,
        planId: paymentRecord.planId,
        amount: paymentRecord.amount,
        status: "active",
        interval: paymentRecord.planId === "1-year" ? "yearly" : paymentRecord.planId === "3-month" ? "quarterly" : "monthly",
        startedAt: now,
        renewsAt,
      });

    return NextResponse.json({
      ok: true,
      refId: refNumber,
      paymentId: paymentRecord.id,
      redirectUrl: "/billing?status=success",
      message: "اشتراک شما با موفقیت فعال شد.",
    });
  } catch (error) {
    console.error("[Payment Gateway Verify Error]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "خطا در تایید پرداخت" },
      { status: 500 }
    );
  }
}
