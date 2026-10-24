import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, plans, profiles } from "@/db/schema";
import { getSessionUserId } from "@/lib/auth-helpers";
import { createCartBeCartOrder } from "@/lib/cartbecart";
import { ensurePlans } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await ensurePlans();

    // Authenticate user from session cookie
    const token = request.cookies.get("arama-user")?.value;
    const userId = getSessionUserId(token);
    if (!userId) {
      return NextResponse.json(
        { error: "برای پرداخت باید ابتدا وارد حساب کاربری خود شوید." },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as { planId?: string; plan?: string };
    const planId = body.planId || body.plan || "1-month";

    const [selectedPlan] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);

    if (!selectedPlan) {
      return NextResponse.json({ error: "پلن انتخابی معتبر نیست." }, { status: 400 });
    }

    const host = request.headers.get("host");
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (host ? `${forwardedProto || "https"}://${host}` : "https://arama.life");

    const authority = `ARM_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Create pending payment in database
    const [newPayment] = await db
      .insert(payments)
      .values({
        userId,
        planId: selectedPlan.id,
        amount: selectedPlan.price,
        authority,
        status: "pending",
      })
      .returning();

    let paymentUrl = `/payment/ipg/${newPayment.id}`;

    // 1. Try CartBeCart automated gateway if API key is present
    const cartbecartKey = process.env.CARTBECART_API_KEY?.trim();
    if (cartbecartKey) {
      try {
        const cbcRes = await createCartBeCartOrder({
          amount: selectedPlan.price * 10, // Rials
          callbackUrl: `${baseUrl}/api/payment/cartbecart/callback?paymentId=${newPayment.id}`,
          merchantOrderId: `ARM-${newPayment.id.slice(0, 8)}`,
        });

        if (cbcRes.payment_url) {
          paymentUrl = cbcRes.payment_url;
          // Store CartBeCart payment token in authority for later inquiry
          await db
            .update(payments)
            .set({ authority: cbcRes.payment_token || cbcRes.order_id })
            .where(eq(payments.id, newPayment.id));
        }
      } catch (cbcErr) {
        console.warn("[Payment Gateway] CartBeCart request fell back to Direct IPG:", cbcErr);
      }
    }

    return NextResponse.json({
      ok: true,
      url: paymentUrl,
      paymentUrl,
      paymentId: newPayment.id,
      authority,
      planName: selectedPlan.name,
      amountToman: selectedPlan.price,
      amountRial: selectedPlan.price * 10,
    });
  } catch (error) {
    console.error("[Payment Gateway Create Error]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "خطا در برقراری ارتباط با درگاه پرداخت" },
      { status: 500 }
    );
  }
}
