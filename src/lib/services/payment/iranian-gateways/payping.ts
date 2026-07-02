/**
 * PayPing Payment Gateway Service
 * https://payping.ir/
 */

export interface PayPingRequest {
    amount: number; // In Rials
    returnUrl: string;
    clientRefId: string;
    payerName?: string;
    payerEmail?: string;
    description?: string;
    metaData?: Record<string, string>;
}

export interface PayPingResponse {
    code: number;
    error?: string;
    authority?: string;
}

export interface PayPingVerifyRequest {
    amount: number;
    refId: string;
}

export interface PayPingVerifyResponse {
    code: number;
    error?: string;
    cardNumber?: string;
    amount?: number;
    refId?: string;
    description?: string;
    cardHash?: string;
    transactionId?: string;
    additionalData?: string;
}

const PAYPING_SANDBOX_URL = "https://sandbox.payping.ir/v1/pay/";
const PAYPING_PRODUCTION_URL = "https://api.payping.ir/v1/pay/";

export class PayPingGateway {
    private apiToken: string;
    private isSandbox: boolean;

    constructor(apiToken?: string, isSandbox = true) {
        this.apiToken = apiToken || process.env.PAYPING_API_TOKEN || "";
        this.isSandbox = isSandbox;
    }

    private getBaseUrl(): string {
        return this.isSandbox ? PAYPING_SANDBOX_URL : PAYPING_PRODUCTION_URL;
    }

    /**
     * Request a payment from PayPing conforming to PaymentGateway interface
     * @param amount Amount in Rials
     * @param description Payment description
     * @param callbackUrl The URL to redirect user after payment
     * @param metadata Optional metadata to store
     * @returns Payment URL and authority code
     */
    async requestPayment(
        amount: number,
        description: string,
        callbackUrl: string,
        metadata?: Record<string, string>
    ): Promise<{ authority: string; url: string }> {
        const requestData: PayPingRequest = {
            amount,
            returnUrl: callbackUrl,
            clientRefId: metadata?.paymentId || metadata?.userId || "Ref-" + Math.floor(Math.random() * 1000000),
            payerName: metadata?.payerName,
            payerEmail: metadata?.payerEmail,
            description,
            metaData: metadata,
        };

        const response = await fetch(`${this.getBaseUrl()}post`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiToken}`,
            },
            body: JSON.stringify(requestData),
        });

        const result: PayPingResponse = await response.json();

        if (result.code === -1 && result.authority) {
            // Success - return payment URL
            return {
                authority: result.authority,
                url: `https://api.payping.ir/v1/pay/gotoToken/${result.authority}`,
            };
        }

        throw new Error(
            `PayPing payment request failed: ${result.error || "Unknown error"}`
        );
    }

    /**
     * Verify a payment with PayPing
     * @param amount Amount in Rials
     * @param refId The refId (authority code) from payment request
     * @returns Verification result
     */
    async verifyPayment(
        authority: string,
        amount: number
    ): Promise<{ success: boolean; refId?: string; transactionId?: string; cardNumber?: string; message: string }> {
        const requestData: PayPingVerifyRequest = {
            amount,
            refId: authority,
        };

        const response = await fetch(`${this.getBaseUrl()}verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiToken}`,
            },
            body: JSON.stringify(requestData),
        });

        const result: PayPingVerifyResponse = await response.json();

        if (result.code === -1) {
            return {
                success: true,
                refId: result.refId,
                transactionId: result.transactionId,
                cardNumber: result.cardNumber,
                message: "Payment verified successfully",
            };
        }

        return {
            success: false,
            message: result.error || "Verification failed",
        };
    }

    /**
     * Check if payment was successful based on status code
     */
    isPaymentSuccessful(code: number): boolean {
        return code === -1;
    }
}