import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, plans } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { createCartBeCartOrder } from "@/lib/cartbecart";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;

  try {
    const { planId } = await request.json();
    if (!planId) return NextResponse.json({ error: "شناسه طرح الزامی است." }, { status: 400 });

    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
    if (!plan) return NextResponse.json({ error: "طرح نامعتبر است." }, { status: 404 });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin || "https://arama.life";
    const authority = `ARM_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Create pending payment record
    const [newPayment] = await db
      .insert(payments)
      .values({
        userId: user.userId,
        planId: plan.id,
        amount: plan.price,
        authority,
        status: "pending",
      })
      .returning();

    let paymentUrl = `/payment/ipg/${newPayment.id}`;

    // 1. Check CartBeCart automated gateway if API key is set
    const cartbecartKey = process.env.CARTBECART_API_KEY?.trim();
    if (cartbecartKey) {
      try {
        const cbcRes = await createCartBeCartOrder({
          amount: plan.price * 10, // Rials
          callbackUrl: `${baseUrl}/api/payment/cartbecart/callback?paymentId=${newPayment.id}`,
          merchantOrderId: `ARM-${newPayment.id.slice(0, 8)}`,
        });

        if (cbcRes.payment_url) {
          paymentUrl = cbcRes.payment_url;
          await db
            .update(payments)
            .set({ authority: cbcRes.payment_token || cbcRes.order_id })
            .where(eq(payments.id, newPayment.id));
        }
      } catch (cbcErr) {
        console.warn("[Payment Request] CartBeCart fell back to Direct IPG:", cbcErr);
      }
    }

    return NextResponse.json({
      ok: true,
      url: paymentUrl,
      paymentId: newPayment.id,
    });
  } catch (error) {
    console.error("[Payment Request Error]:", error);
    return NextResponse.json({ error: "خطای داخلی در برقراری ارتباط با درگاه پرداخت" }, { status: 500 });
  }
}
