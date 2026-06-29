/**
 * ZarinPal Payment Gateway Service
 * https://www.zarinpal.com/
 */

export interface ZarinPalRequest {
    merchant_id: string;
    amount: number; // In Rials
    description: string;
    callback_url: string;
    metadata?: Record<string, string>;
}

export interface ZarinPalResponse {
    data: {
        code: number;
        message: string;
        authority?: string;
        fee?: number;
        fee_type?: string;
    };
    errors?: any;
}

export interface ZarinPalVerifyRequest {
    merchant_id: string;
    authority: string;
    amount: number; // In Rials
}

export interface ZarinPalVerifyResponse {
    data: {
        code: number;
        message: string;
        card_pan?: string;
        card_hash?: string;
        ref_id?: number;
        fee?: number;
        fee_type?: string;
    };
    errors?: any;
}

const ZARINPAL_SANDBOX_URL = "https://sandbox.zarinpal.com/pg/rest/WebGate/";
const ZARINPAL_PRODUCTION_URL = "https://www.zarinpal.com/pg/rest/WebGate/";

export class ZarinPalGateway {
    private merchantId: string;
    private isSandbox: boolean;

    constructor(merchantId?: string, isSandbox = true) {
        this.merchantId = merchantId || process.env.ZARINPAL_MERCHANT_ID || "";
        this.isSandbox = isSandbox;
    }

    private getBaseUrl(): string {
        return this.isSandbox ? ZARINPAL_SANDBOX_URL : ZARINPAL_PRODUCTION_URL;
    }

    /**
     * Request a payment from ZarinPal
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
        const requestData: ZarinPalRequest = {
            merchant_id: this.merchantId,
            amount,
            description,
            callback_url: callbackUrl,
            metadata,
        };

        const response = await fetch(`${this.getBaseUrl()}PaymentRequest.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(requestData),
        });

        const result: ZarinPalResponse = await response.json();

        if (result.data.code === 100) {
            // Success - return payment URL and authority
            const startPayUrl = this.isSandbox
                ? "https://sandbox.zarinpal.com/pg/StartPay/"
                : "https://www.zarinpal.com/pg/StartPay/";

            return {
                authority: result.data.authority!,
                url: `${startPayUrl}${result.data.authority}`,
            };
        }

        throw new Error(
            `ZarinPal payment request failed: ${result.data.message || "Unknown error"}`
        );
    }

    /**
     * Verify a payment with ZarinPal
     * @param authority The authority code from payment request
     * @param amount Amount in Rials
     * @returns Verification result with ref_id on success
     */
    async verifyPayment(
        authority: string,
        amount: number
    ): Promise<{ success: boolean; refId?: number; message: string }> {
        const requestData: ZarinPalVerifyRequest = {
            merchant_id: this.merchantId,
            authority,
            amount,
        };

        const response = await fetch(`${this.getBaseUrl()}PaymentVerification.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(requestData),
        });

        const result: ZarinPalVerifyResponse = await response.json();

        if (result.data.code === 100) {
            return {
                success: true,
                refId: result.data.ref_id,
                message: result.data.message,
            };
        }

        return {
            success: false,
            message: result.data.message || "Verification failed",
        };
    }

    /**
     * Check if payment was successful based on authority code
     * Used for callback validation
     */
    isPaymentSuccessful(code: number): boolean {
        return code === 100;
    }
}