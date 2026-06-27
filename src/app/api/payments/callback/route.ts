import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import db from "@/lib/db";
import { payments, subscriptions } from "@/db/schema";
import { eq, and, asc, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Verify the payment and update subscription
    try {
      const paymentId = session.metadata?.paymentId;
      if (!paymentId) {
        throw new Error("No paymentId in session metadata");
      }

      // Find the payment record by metadata
      const paymentResult = await db.update(payments)
        .set({ 
          status: "SUCCESS",
          gatewayRefId: session.payment_intent as string,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentId))
        .returning();

      const payment = paymentResult[0];
      if (!payment) {
        throw new Error("Payment record not found");
      }

      if (!payment.subscriptionId) {
        throw new Error("Payment is not associated with any subscription");
      }

      // Update subscription status to active
      await db.update(subscriptions)
        .set({
          status: "ACTIVE",
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, payment.subscriptionId));
    } catch (err) {
      console.error("Error processing payment callback:", err);
      return NextResponse.json(
        { error: "Error processing payment callback" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}