import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { plans, payments } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { ensurePlans } from "@/lib/demo-data";
import { createCartBeCartOrder } from "@/lib/cartbecart";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;

  try {
    const { planId } = (await request.json()) as { planId?: string };

    if (!planId) {
      return NextResponse.json(
        { error: "طرح مورد نظر را انتخاب کن." },
        { status: 400 },
      );
    }

    await ensurePlans();

    // Fetch the chosen plan
    const [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);

    if (!plan) {
      return NextResponse.json(
        { error: "طرح مورد نظر یافت نشد." },
        { status: 404 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin || "https://arama.life";
    const authority = `ARM_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Insert pending payment into DB
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

    // CartBeCart Gateway
    const cartbecartKey = process.env.CARTBECART_API_KEY?.trim();
    if (cartbecartKey) {
      try {
        const cbcRes = await createCartBeCartOrder({
          amount: plan.price * 10,
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
        console.warn("[Subscription Checkout] CartBeCart fell back to Direct IPG:", cbcErr);
      }
    }

    return NextResponse.json({ url: paymentUrl, paymentId: newPayment.id });
  } catch (error) {
    console.error("Checkout processing error:", error);
    return NextResponse.json(
      { error: "امکان پردازش پرداخت در حال حاضر وجود ندارد." },
      { status: 500 },
    );
  }
}
