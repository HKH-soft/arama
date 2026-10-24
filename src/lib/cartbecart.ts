const CARTBECART_API_URL = "https://api.cartbecart.com/api/v1/public/orders";

export function getCartBeCartApiKey(): string {
  const key = process.env.CARTBECART_API_KEY?.trim();
  if (!key) throw new Error("CARTBECART_API_KEY environment variable is not set");
  return key;
}

export function getCartBeCartSignatureSecret(): string {
  const secret = process.env.CARTBECART_SIGNATURE_SECRET?.trim();
  if (!secret) throw new Error("CARTBECART_SIGNATURE_SECRET environment variable is not set");
  return secret;
}

export type CreateOrderParams = {
  amount: number; // in Rials
  callbackUrl: string;
  merchantOrderId: string;
};

export type CartBeCartOrderResponse = {
  order_id: string;
  order_code: string;
  payment_token: string;
  payment_url: string;
  unique_amount: number;
  merchant_amount?: number | null;
  fee_amount?: number | null;
  expires_at: string;
};

export type CartBeCartStatusResponse = {
  order_id: string;
  order_code: string;
  status: "pending" | "paid" | "needs_review" | "expired";
  base_amount: number;
  unique_amount: number;
  merchant_amount?: number | null;
  fee_amount?: number | null;
  merchant_order_id?: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  paid_at?: string | null;
  expires_at: string;
  grace_ends_at?: string;
};

export async function createCartBeCartOrder(params: CreateOrderParams): Promise<CartBeCartOrderResponse> {
  const apiKey = getCartBeCartApiKey();
  if (!apiKey) {
    throw new Error("کلید API درگاه کارت‌به‌کارت تنظیم نشده است.");
  }

  const response = await fetch(CARTBECART_API_URL, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(params.amount),
      callback_url: params.callbackUrl,
      merchant_order_id: params.merchantOrderId,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const msg = typeof errBody?.detail === "string" ? errBody.detail : `خطای سرور کارت‌به‌کارت (${response.status})`;
    throw new Error(msg);
  }

  return (await response.json()) as CartBeCartOrderResponse;
}

export async function inquireCartBeCartOrder(tokenOrId: string): Promise<CartBeCartStatusResponse | null> {
  const apiKey = getCartBeCartApiKey();
  if (!apiKey || !tokenOrId) return null;

  const url = `${CARTBECART_API_URL}/${encodeURIComponent(tokenOrId.trim())}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-API-Key": apiKey,
      Accept: "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as CartBeCartStatusResponse;
}