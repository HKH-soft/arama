/**
 * Unified Payment Service
 * Supports multiple payment gateways including Iranian gateways
 */

import { GatewayFactory, GatewayType } from "./iranian-gateways/gateway-factory";
import db from "@/lib/db";
import { payments, subscriptions, subscriptionPlans } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { logAudit } from "@/lib/audit";

// Simple in-memory rate limiter for payment endpoints
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

async function simpleRateLimit(maxRequests: number, windowMs: number, identifier: string): Promise<boolean> {
  const now = Date.now();
  const currentWindow = Math.floor(now / windowMs) * windowMs;
  const bucketKey = `${identifier}:${currentWindow}`;
  
  let entry = inMemoryStore.get(bucketKey);
  if (!entry) {
    entry = { count: 0, resetTime: currentWindow + windowMs };
    inMemoryStore.set(bucketKey, entry);
  }
  
  entry.count++;
  
  // Set timeout to clean up after window
  setTimeout(() => {
    inMemoryStore.delete(bucketKey);
  }, windowMs);
  
  return entry.count <= maxRequests;
}

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
        returnUrl: string,
        clientRequestId?: string
    ): Promise<PaymentSessionData> {
        // Rate limit per user
        const rateLimitSuccess = await simpleRateLimit(
            5, // Max 5 requests
            60 * 1000, // Per minute
            `payment_creation_${userId}`
        );
        
        if (!rateLimitSuccess) {
            await logAudit({
                userId,
                action: "PAYMENT_CREATION_RATE_LIMITED",
                metadata: { userId, planId, gateway, returnUrl },
            });
            throw new Error("Rate limit exceeded. Please try again later.");
        }

        // Get plan details
        const planResult = await db
            .select()
            .from(subscriptionPlans)
            .where(eq(subscriptionPlans.id, planId));

        if (planResult.length === 0) {
            await logAudit({
                userId,
                action: "PAYMENT_PLAN_NOT_FOUND",
                metadata: { userId, planId },
            });
            throw new Error("Plan not found");
        }

        const plan = planResult[0];

        // Convert amount to Rials if needed (assuming plan.price is in Toman)
        const amountInRials = Math.round(plan.price * 10);

        // Check for existing payment with the same clientRequestId to prevent duplicates
        if (clientRequestId) {
            const existingPayment = await db
                .select()
                .from(payments)
                .where(and(
                    eq(payments.userId, userId),
                    eq(payments.idempotencyKey, clientRequestId)
                ));
            
            if (existingPayment.length > 0) {
                await logAudit({
                    userId,
                    action: "PAYMENT_DUPLICATE_REQUEST",
                    entity: "payment",
                    entityId: existingPayment[0].id,
                    metadata: { userId, planId, clientRequestId },
                });
                
                return {
                    paymentId: existingPayment[0].id,
                    sessionId: existingPayment[0].gatewayRefId || "",
                    url: existingPayment[0].callbackUrl || "",
                    amount: existingPayment[0].amount,
                    currency: existingPayment[0].currency,
                    status: existingPayment[0].status,
                };
            }
        }

        // Use transaction for atomic creation of subscription and payment records
        return await db.transaction(async (tx) => {
            // Create subscription record
            const subscriptionResult = await tx
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
            const paymentResult = await tx
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
                    idempotencyKey: clientRequestId, // Store the idempotency key
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

            // Log payment creation
            await logAudit({
                userId,
                action: "PAYMENT_CREATED",
                entity: "payment",
                entityId: payment.id,
                metadata: { 
                    userId, 
                    planId, 
                    gateway, 
                    amount: amountInRials, 
                    currency: "IRR",
                    paymentId: payment.id,
                    returnUrl
                },
            });

            return {
                paymentId: payment.id,
                sessionId: sessionData.authority,
                url: sessionData.url,
                amount: amountInRials,
                currency: "IRR",
                status: "PENDING",
            };
        });
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
            await logAudit({
                action: "PAYMENT_VERIFICATION_FAILED",
                entity: "payment",
                entityId: paymentId,
                metadata: { paymentId, authority, gateway, error: "Payment not found" },
            });
            throw new Error("Payment not found");
        }

        const payment = paymentResult[0];
        const userId = payment.userId;

        // Get gateway instance
        const paymentGateway = GatewayFactory.getGateway(gateway);

        // Verify payment
        const verificationResult = await paymentGateway.verifyPayment(
            authority,
            payment.amount
        );

        // Use transaction for atomic updates
        const result = await db.transaction(async (tx) => {
            if (verificationResult.success) {
                // Update payment status
                await tx
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
                    await tx
                        .update(subscriptions)
                        .set({
                            status: "ACTIVE",
                            paymentGatewayRef: String(verificationResult.refId || authority),
                            updatedAt: new Date(),
                        })
                        .where(eq(subscriptions.id, payment.subscriptionId));
                }
                
                // Log successful payment verification
                await logAudit({
                    userId,
                    action: "PAYMENT_VERIFIED_SUCCESS",
                    entity: "payment",
                    entityId: paymentId,
                    metadata: { 
                        paymentId, 
                        authority, 
                        gateway, 
                        refId: verificationResult.refId,
                        subscriptionId: payment.subscriptionId
                    },
                });
            } else {
                // Update payment status to failed
                await tx
                    .update(payments)
                    .set({
                        status: "FAILED",
                        updatedAt: new Date(),
                    })
                    .where(eq(payments.id, paymentId));
                
                // Log failed payment verification
                await logAudit({
                    userId,
                    action: "PAYMENT_VERIFIED_FAILED",
                    entity: "payment",
                    entityId: paymentId,
                    metadata: { 
                        paymentId, 
                        authority, 
                        gateway, 
                        message: verificationResult.message 
                    },
                });
            }

            return verificationResult;
        });
        
        return result;
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
            .select()
            .from(payments)
            .where(eq(payments.id, paymentId));
            
        if (paymentResult.length === 0) {
            throw new Error("Payment not found");
        }
        
        const userId = paymentResult[0].userId;

        const result = await db.transaction(async (tx) => {
            const paymentResult = await tx
                .update(payments)
                .set({
                    status: "REFUNDED",
                    updatedAt: new Date(),
                })
                .where(eq(payments.id, paymentId))
                .returning();

            const payment = paymentResult[0];

            if (payment && payment.subscriptionId) {
                await tx
                    .update(subscriptions)
                    .set({
                        status: "CANCELED",
                        cancelledAt: new Date(),
                    })
                    .where(eq(subscriptions.id, payment.subscriptionId));
            }

            // Log refund
            await logAudit({
                userId,
                action: "PAYMENT_REFUNDED",
                entity: "payment",
                entityId: paymentId,
                metadata: { 
                    paymentId, 
                    subscriptionId: payment.subscriptionId,
                    refundedAt: new Date()
                },
            });

            return payment;
        });
        
        return result;
    }
}