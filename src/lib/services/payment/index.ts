/**
 * Unified Payment Service
 * Supports multiple payment gateways including Iranian gateways
 */

import { GatewayFactory, GatewayType } from "./iranian-gateways/gateway-factory";
import db from "@/lib/db";
import { payments, subscriptions, subscriptionPlans } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface PaymentSessionData {
    paymentId: string;
    sessionId: string;
    url: string;
    amount: number;
    currency: string;
    status: string;
}

export class PaymentService {
    /**
     * Create a payment session using the specified gateway
     */
    static async createPaymentSession(
        userId: string,
        planId: string,
        gateway: GatewayType = "zarinpal",
        returnUrl: string
    ): Promise<PaymentSessionData> {
        // Get plan details
        const planResult = await db
            .select()
            .from(subscriptionPlans)
            .where(eq(subscriptionPlans.id, planId));

        if (planResult.length === 0) {
            throw new Error("Plan not found");
        }

        const plan = planResult[0];

        // Convert amount to Rials if needed (assuming plan.price is in Toman)
        const amountInRials = Math.round(plan.price * 10);

        // Create subscription record
        const subscriptionResult = await db
            .insert(subscriptions)
            .values({
                id: randomUUID(),
                userId,
                planId: plan.id,
                status: "PENDING",
                startDate: new Date(),
                endDate: new Date(
                    Date.now() + plan.durationDays * 24 * 60 * 60 * 1000
                ),
            })
            .returning();

        // Create payment record
        const paymentResult = await db
            .insert(payments)
            .values({
                id: randomUUID(),
                userId,
                subscriptionId: subscriptionResult[0].id,
                amount: amountInRials,
                currency: "IRR",
                status: "PENDING",
                gatewayName: gateway,
                description: `پرداخت برای پلن ${plan.displayName}`,
                callbackUrl: returnUrl,
            })
            .returning();

        const payment = paymentResult[0];

        // Get gateway instance
        const paymentGateway = GatewayFactory.getGateway(gateway);

        // Create payment session with the gateway
        const sessionData = await paymentGateway.requestPayment(
            amountInRials,
            `پرداخت برای پلن ${plan.displayName}`,
            returnUrl,
            {
                paymentId: payment.id,
                userId,
                planId,
            }
        );

        return {
            paymentId: payment.id,
            sessionId: sessionData.authority,
            url: sessionData.url,
            amount: amountInRials,
            currency: "IRR",
            status: "PENDING",
        };
    }

    /**
     * Verify a payment with the gateway
     */
    static async verifyPayment(
        paymentId: string,
        authority: string,
        gateway: GatewayType
    ): Promise<{ success: boolean; refId?: string | number; message: string }> {
        // Get payment record
        const paymentResult = await db
            .select()
            .from(payments)
            .where(eq(payments.id, paymentId));

        if (paymentResult.length === 0) {
            throw new Error("Payment not found");
        }

        const payment = paymentResult[0];

        // Get gateway instance
        const paymentGateway = GatewayFactory.getGateway(gateway);

        // Verify payment
        const verificationResult = await paymentGateway.verifyPayment(
            authority,
            payment.amount
        );

        if (verificationResult.success) {
            // Update payment status
            await db
                .update(payments)
                .set({
                    status: "SUCCESS",
                    gatewayRefId: String(verificationResult.refId || authority),
                    paidAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(payments.id, paymentId));

            // Update subscription status
            if (payment.subscriptionId) {
                await db
                    .update(subscriptions)
                    .set({
                        status: "ACTIVE",
                        paymentGatewayRef: String(verificationResult.refId || authority),
                        updatedAt: new Date(),
                    })
                    .where(eq(subscriptions.id, payment.subscriptionId));
            }
        } else {
            // Update payment status to failed
            await db
                .update(payments)
                .set({
                    status: "FAILED",
                    updatedAt: new Date(),
                })
                .where(eq(payments.id, paymentId));
        }

        return verificationResult;
    }

    /**
     * Get payment by ID
     */
    static async getPayment(paymentId: string) {
        const result = await db
            .select()
            .from(payments)
            .where(eq(payments.id, paymentId));

        return result[0] || null;
    }

    /**
     * Get user payments
     */
    static async getUserPayments(userId: string) {
        return await db
            .select()
            .from(payments)
            .where(eq(payments.userId, userId))
            .orderBy((payments) => [payments.createdAt]);
    }

    /**
     * Refund a payment
     * Note: Actual refund must be processed through the payment gateway's API
     * This method only updates the database status
     */
    static async refundPayment(paymentId: string) {
        const paymentResult = await db
            .update(payments)
            .set({
                status: "REFUNDED",
                updatedAt: new Date(),
            })
            .where(eq(payments.id, paymentId))
            .returning();

        const payment = paymentResult[0];

        if (payment && payment.subscriptionId) {
            await db
                .update(subscriptions)
                .set({
                    status: "CANCELED",
                    cancelledAt: new Date(),
                })
                .where(eq(subscriptions.id, payment.subscriptionId));
        }

        return payment;
    }
}