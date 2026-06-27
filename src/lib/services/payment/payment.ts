import db from "@/lib/db";
import { payments, users, subscriptions, subscriptionPlans } from "../../../db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface PaymentIntentData {
  userId: string;
  amount: number;
  currency: string;
  description?: string;
  callbackUrl?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  gatewayRefId?: string;
  errorMessage?: string;
}

export class PaymentService {
  static async createPaymentSession(userId: string, planId: string, returnUrl: string) {
    // This method creates a payment session (like Stripe checkout session)
    try {
      // First get the plan details to determine the amount
      const planResult = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, planId));
      
      if (planResult.length === 0) {
        throw new Error("Plan not found");
      }
      
      const plan = planResult[0];
      
      // Create payment record
      const paymentIntent = await db.insert(payments).values({
        id: randomUUID(),
        userId,
        amount: plan.price,
        currency: "IRR", // Using Iranian Rial as default
        description: `Payment for ${plan.displayName} subscription`,
        callbackUrl: returnUrl,
        status: "PENDING",
        gatewayName: "test_gateway", // Would be determined by the actual payment processor
      }).returning();
      
      return {
        id: paymentIntent[0].id,
        status: paymentIntent[0].status,
        amount: paymentIntent[0].amount,
        currency: paymentIntent[0].currency,
        userId: paymentIntent[0].userId,
        paymentId: paymentIntent[0].id, // Adding the missing property
        sessionId: paymentIntent[0].id, // Using the same ID as session ID for simplicity
        url: returnUrl, // In a real implementation, this would be the payment gateway URL
      };
    } catch (error) {
      console.error("Error creating payment session:", error);
      throw error;
    }
  }

  async createPaymentIntent(data: PaymentIntentData): Promise<PaymentResult> {
    try {
      // In a real implementation, this would integrate with a payment gateway
      // For now, we'll simulate creating a payment record
      
      const payment = await db.insert(payments).values({
        id: randomUUID(),
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        callbackUrl: data.callbackUrl,
        status: "PENDING",
        gatewayName: "test_gateway", // Would be determined by the actual payment processor
      }).returning();

      return {
        success: true,
        paymentId: payment[0].id,
      };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      return {
        success: false,
        errorMessage: "Failed to create payment intent",
      };
    }
  }

  async processPayment(paymentId: string): Promise<PaymentResult> {
    try {
      // In a real implementation, this would communicate with a payment gateway
      // For now, we'll just update the payment status
      
      const paymentResult = await db.update(payments)
        .set({ status: "SUCCESS", paidAt: new Date() })
        .where(eq(payments.id, paymentId))
        .returning();

      if (paymentResult.length === 0) {
        return {
          success: false,
          errorMessage: "Payment not found",
        };
      }

      // Update subscription status if payment was for a subscription
      const payment = paymentResult[0];
      if (payment.subscriptionId) {
        await db.update(subscriptions)
          .set({ status: "ACTIVE" })
          .where(eq(subscriptions.id, payment.subscriptionId));
      }

      return {
        success: true,
        paymentId: payment.id,
      };
    } catch (error) {
      console.error("Error processing payment:", error);
      return {
        success: false,
        errorMessage: "Failed to process payment",
      };
    }
  }

  async refundPayment(paymentId: string): Promise<PaymentResult> {
    try {
      // In a real implementation, this would communicate with a payment gateway
      // For now, we'll just update the payment status
      
      const paymentResult = await db.update(payments)
        .set({ status: "REFUNDED" })
        .where(eq(payments.id, paymentId))
        .returning();

      if (paymentResult.length === 0) {
        return {
          success: false,
          errorMessage: "Payment not found",
        };
      }

      return {
        success: true,
        paymentId: paymentResult[0].id,
      };
    } catch (error) {
      console.error("Error refunding payment:", error);
      return {
        success: false,
        errorMessage: "Failed to refund payment",
      };
    }
  }
}