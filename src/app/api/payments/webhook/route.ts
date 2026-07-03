import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/services/payment";
import { logAudit } from "@/lib/audit";
import db from "@/lib/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Zod schema for webhook payload validation
const WebhookPayloadSchema = z.object({
  event: z.string(), // The event type (e.g., "payment.success", "payment.failed")
  data: z.object({
    paymentId: z.string(),
    authority: z.string(),
    gateway: z.enum(["zarinpal", "payping"]), // Supported gateways
    status: z.string(),
    refId: z.string().optional(),
    amount: z.number().optional(),
  }),
  idempotency_key: z.string().optional(), // For preventing duplicate processing
});

export async function POST(request: NextRequest) {
  try {
    // Read raw body to verify signature
    const rawBody = await request.text();
    
    // Validate the webhook payload
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      await logAudit({
        action: "PAYMENT_WEBHOOK_PARSE_ERROR",
        metadata: { error: "Invalid JSON", rawBody: rawBody.substring(0, 200) },
      });
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Validate payload structure
    const validationResult = WebhookPayloadSchema.safeParse(payload);
    if (!validationResult.success) {
      await logAudit({
        action: "PAYMENT_WEBHOOK_VALIDATION_ERROR",
        metadata: { 
          error: validationResult.error.issues,
          payload
        },
      });
      return NextResponse.json(
        { error: "Invalid payload", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const validatedPayload = validationResult.data;
    const { data: eventData } = validatedPayload;
    const { paymentId, authority, gateway, status } = eventData;

    // Verify webhook signature (implement according to your payment gateway)
    const isValidSignature = await verifyWebhookSignature(request, rawBody);
    if (!isValidSignature) {
      await logAudit({
        action: "PAYMENT_WEBHOOK_INVALID_SIGNATURE",
        metadata: { paymentId, gateway },
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 410 });
    }

    // Check for idempotency to prevent duplicate processing
    if (validatedPayload.idempotency_key) {
      const existingProcessedEvent = await db
        .select()
        .from(payments)
        .where(eq(payments.idempotencyKey, validatedPayload.idempotency_key));
      
      if (existingProcessedEvent.length > 0) {
        // Event already processed, return success to prevent retries
        await logAudit({
          action: "PAYMENT_WEBHOOK_DUPLICATE_EVENT",
          metadata: { 
            paymentId, 
            idempotencyKey: validatedPayload.idempotency_key,
            processedAt: existingProcessedEvent[0].updatedAt
          },
        });
        return NextResponse.json({ 
          message: "Event already processed", 
          paymentId: existingProcessedEvent[0].id 
        });
      }
    }

    // Verify that the payment exists and is in a valid state for processing
    const payment = await PaymentService.getPayment(paymentId);
    if (!payment) {
      await logAudit({
        action: "PAYMENT_WEBHOOK_PAYMENT_NOT_FOUND",
        metadata: { paymentId },
      });
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Prevent processing if payment is already completed
    if (["SUCCESS", "FAILED", "REFUNDED"].includes(payment.status.toUpperCase())) {
      await logAudit({
        action: "PAYMENT_WEBHOOK_ALREADY_PROCESSED",
        entity: "payment",
        entityId: paymentId,
        metadata: { 
          paymentId, 
          currentStatus: payment.status,
          receivedStatus: status
        },
      });
      return NextResponse.json({ 
        message: "Payment already processed", 
        status: payment.status 
      });
    }

    // Process the webhook based on event type
    switch (validatedPayload.event) {
      case "payment.success":
        if (status !== "VERIFIED") {
          await logAudit({
            action: "PAYMENT_WEBHOOK_VERIFICATION_FAILED", 
            metadata: { paymentId, status },
          });
          return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
        }

        // Verify payment with the gateway
        const result = await PaymentService.verifyPayment(
          paymentId,
          authority,
          gateway as any
        );

        if (result.success) {
          // Update the payment record with idempotency key to prevent reprocessing
          if (validatedPayload.idempotency_key) {
            await db
              .update(payments)
              .set({ idempotencyKey: validatedPayload.idempotency_key })
              .where(eq(payments.id, paymentId));
          }
          
          await logAudit({
            userId: payment.userId,
            action: "PAYMENT_VERIFIED_SUCCESS_VIA_WEBHOOK",
            entity: "payment",
            entityId: paymentId,
            metadata: { 
              paymentId, 
              authority, 
              gateway,
              refId: result.refId
            },
          });
          
          return NextResponse.json({ 
            success: true,
            paymentId,
            refId: result.refId
          });
        } else {
          await logAudit({
            userId: payment.userId,
            action: "PAYMENT_VERIFICATION_ERROR_VIA_WEBHOOK",
            entity: "payment",
            entityId: paymentId,
            metadata: { 
              paymentId, 
              authority, 
              gateway, 
              message: result.message 
            },
          });
          return NextResponse.json({ 
            error: result.message, 
            success: false 
          }, { status: 400 });
        }

      case "payment.failed":
        // Update payment status to failed
        await db
          .update(payments)
          .set({
            status: "FAILED",
            updatedAt: new Date(),
          })
          .where(eq(payments.id, paymentId));

        await logAudit({
          userId: payment.userId,
          action: "PAYMENT_MARKED_FAILED_VIA_WEBHOOK",
          entity: "payment",
          entityId: paymentId,
          metadata: { 
            paymentId, 
            authority, 
            gateway,
            reason: "Webhook reported failure"
          },
        });

        return NextResponse.json({ 
          success: true,
          paymentId,
          status: "FAILED"
        });

      default:
        await logAudit({
          action: "PAYMENT_WEBHOOK_UNKNOWN_EVENT",
          metadata: { event: validatedPayload.event, paymentId },
        });
        return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
    }
  } catch (err) {
    console.error("Secure payment webhook error:", err);
    await logAudit({
      action: "PAYMENT_WEBHOOK_ERROR",
      metadata: { 
        error: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined
      },
    });
    return NextResponse.json(
      { error: "Webhook processing error" }, 
      { status: 500 }
    );
  }
}

/**
 * Verify the webhook signature from the payment gateway
 * This is a placeholder - implement according to your payment gateway's specification
 */
async function verifyWebhookSignature(request: NextRequest, rawBody: string): Promise<boolean> {
  // This is a simplified verification - implement according to your payment gateway's requirements
  // For example, ZarinPal uses a signature in the header that should match the calculated signature of the body
  
  // Example implementation for ZarinPal:
  // const signature = request.headers.get('signature');
  // const calculatedSignature = calculateSignature(rawBody, process.env.ZARINPAL_MERCHANT_ID!);
  // return signature === calculatedSignature;
  
  // For now, return true - this needs to be implemented per gateway specification
  return true; // Placeholder - implement actual signature verification
}