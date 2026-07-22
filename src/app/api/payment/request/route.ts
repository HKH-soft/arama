import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, plans } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;

  try {
    const { planId } = await request.json();
    if (!planId) return NextResponse.json({ error: "شناسه طرح الزامی است." }, { status: 400 });

    const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
    if (!plan) return NextResponse.json({ error: "طرح نامعتبر است." }, { status: 404 });

    const merchantId = process.env.ZARINPAL_MERCHANT_ID || "00000000-0000-0000-0000-000000000000";
    const isSandbox = process.env.ZARINPAL_SANDBOX === "true";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const callbackUrl = `${baseUrl}/api/payment/verify`;
    const apiUrl = isSandbox 
      ? "https://sandbox.zarinpal.com/pg/v4/payment/request.json" 
      : "https://api.zarinpal.com/pg/v4/payment/request.json";

    // Request payment from ZarinPal
    const zpReq = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: plan.price * 10, // ZarinPal amounts are in Rials (if price is Toman)
        description: `خرید اشتراک ${plan.name} - آراما`,
        callback_url: callbackUrl
      })
    });

    const zpRes = await zpReq.json();

    if (zpRes.data && zpRes.data.code === 100) {
      const authority = zpRes.data.authority;

      // Save to database
      await db.insert(payments).values({
        userId: user.userId,
        planId: plan.id,
        amount: plan.price,
        authority: authority,
        status: "pending"
      });

      const paymentUrl = isSandbox
        ? `https://sandbox.zarinpal.com/pg/StartPay/${authority}`
        : `https://www.zarinpal.com/pg/StartPay/${authority}`;

      return NextResponse.json({ url: paymentUrl });
    } else {
      console.error("[ZarinPal Request Error]", zpRes);
      return NextResponse.json({ error: "خطا در اتصال به درگاه پرداخت." }, { status: 500 });
    }
  } catch (error) {
    console.error("[Payment Request]", error);
    return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 });
  }
}
