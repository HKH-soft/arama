/**
 * Iranian Payment Gateway Factory
 * Supports multiple Iranian payment gateways with a unified interface
 */

import { ZarinPalGateway } from "./zarinpal";
import { PayPingGateway } from "./payping";

export type GatewayType = "zarinpal" | "payping";

export interface PaymentGateway {
    requestPayment(
        amount: number,
        description: string,
        callbackUrl: string,
        metadata?: Record<string, string>
    ): Promise<{ authority: string; url: string }>;

    verifyPayment(
        authority: string,
        amount: number
    ): Promise<{
        success: boolean;
        refId?: string | number;
        message: string;
        transactionId?: string;
        cardNumber?: string;
    }>;
}

export class GatewayFactory {
    private static gateways: Map<GatewayType, PaymentGateway> = new Map();

    static registerGateway(type: GatewayType, gateway: PaymentGateway): void {
        this.gateways.set(type, gateway);
    }

    static getGateway(type: GatewayType): PaymentGateway {
        const gateway = this.gateways.get(type);
        if (!gateway) {
            // Try to create the gateway on-demand with environment variables
            switch (type) {
                case "zarinpal":
                    return new ZarinPalGateway();
                case "payping":
                    return new PayPingGateway();
                default:
                    throw new Error(`Unsupported payment gateway: ${type}`);
            }
        }
        return gateway;
    }

    static getAvailableGateways(): GatewayType[] {
        return Array.from(this.gateways.keys());
    }
}

// Initialize default gateways
GatewayFactory.registerGateway("zarinpal", new ZarinPalGateway());
GatewayFactory.registerGateway("payping", new PayPingGateway());