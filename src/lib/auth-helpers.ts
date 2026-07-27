import { type NextRequest, NextResponse } from "next/server";
import { randomBytes, scrypt, createHmac, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { db } from "@/db";
import { rateLimits } from "@/db/schema";
import { sql } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

const AUTH_SECRET = process.env.AUTH_SECRET || "default_dev_secret_only_for_local_dev_123456";

export function signSession(userId: string): string {
  const signature = createHmac("sha256", AUTH_SECRET).update(userId).digest("hex");
  return `${userId}.${signature}`;
}

export function verifySession(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [userId, signature] = parts;
  const expected = createHmac("sha256", AUTH_SECRET).update(userId).digest("hex");
  if (signature !== expected) return null;
  return userId;
}

/** Extract the logged-in user ID from the arama-user cookie. */
export function getUserId(request: NextRequest): string | null {
  const token = request.cookies.get("arama-user")?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Require a logged-in user or return a 401. */
export function requireUser(request: NextRequest): { userId: string } | NextResponse {
  const token = request.cookies.get("arama-user")?.value;
  const userId = token ? verifySession(token) : null;
  
  if (!userId) {
    const res = NextResponse.json({ error: "لطفاً ابتدا وارد حساب خود شوید." }, { status: 401 });
    if (token) {
      // If a token was provided but it's invalid (e.g. old format), clear it.
      res.cookies.delete("arama-user");
    }
    return res as NextResponse;
  }
  return { userId };
}

/** Hash a plaintext password with a per-user random salt. Returns "salt:hash". */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(24).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

/** Verify a password against a stored "salt:hash" string. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const salt = stored.slice(0, 48);
  const storedHash = stored.slice(49);
  if (!salt || !storedHash) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const saved = Buffer.from(storedHash, "hex");
  return derived.length === saved.length && timingSafeEqual(derived, saved);
}

/** Hash an OTP code with a random salt. Returns "salt:hash". */
export async function hashOtpCode(code: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(code, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

/** Verify an OTP code against a stored "salt:hash" string. */
export async function verifyOtpCode(code: string, stored: string): Promise<boolean> {
  const salt = stored.slice(0, 32);
  const storedHash = stored.slice(33);
  if (!salt || !storedHash) return false;
  const derived = (await scryptAsync(code, salt, 64)) as Buffer;
  const saved = Buffer.from(storedHash, "hex");
  return derived.length === saved.length && timingSafeEqual(derived, saved);
}

/** Validate Iranian phone number format: 09xxxxxxxxx (11 digits, starts with 09) */
export function isValidIranianPhone(phone: string): boolean {
  const normalized = phone.trim();
  return /^09\d{9}$/.test(normalized);
}

/** Generate a random 5-digit OTP code */
export function generateOtpCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export type SessionUser = { userId: string; phone: string; name?: string | null };

// ── Rate-limit buckets (PostgreSQL based) ──
const TEN_MIN = 10 * 60 * 1000;
const FIFTEEN_MIN = 15 * 60 * 1000;
const FIVE_MIN = 5 * 60 * 1000;
const TWO_MIN = 2 * 60 * 1000;

async function incrementRateLimit(key: string, limit: number, expireMs: number, lockMs?: number) {
  const now = new Date();
  const result = await db.insert(rateLimits)
    .values({
      key,
      count: 1,
      expiresAt: new Date(now.getTime() + expireMs)
    })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`CASE WHEN ${rateLimits.expiresAt} < ${now} THEN 1 ELSE ${rateLimits.count} + 1 END`,
        expiresAt: sql`CASE WHEN ${rateLimits.expiresAt} < ${now} THEN ${new Date(now.getTime() + expireMs)} ELSE ${rateLimits.expiresAt} END`,
        lockedUntil: sql`CASE WHEN (${rateLimits.count} + 1 > ${limit}) AND ${lockMs ? lockMs : 0} > 0 THEN ${new Date(now.getTime() + (lockMs || 0))} ELSE ${rateLimits.lockedUntil} END`
      }
    })
    .returning();
  return result[0];
}

/** Check OTP request rate limit: max 3 requests per phone per 10 minutes */
export async function checkOtpRequestRateLimit(phone: string): Promise<{ allowed: boolean; remaining: number; error?: string; retryAfter?: number }> {
  const key = `otp-req:${phone}`;
  const now = new Date();
  const bucket = await incrementRateLimit(key, 3, TEN_MIN, FIVE_MIN);
  
  if (bucket.lockedUntil && bucket.lockedUntil > now) {
    const retryAfter = Math.ceil((bucket.lockedUntil.getTime() - now.getTime()) / 1000);
    return { allowed: false, remaining: 0, error: "تعداد درخواست کد زیاد بود. لطفاً چند دقیقه صبر کن.", retryAfter };
  }
  
  if (bucket.count > 3) {
    return { allowed: false, remaining: 0, error: "تعداد درخواست کد زیاد بود. لطفاً ۵ دقیقه صبر کن.", retryAfter: 300 };
  }
  return { allowed: true, remaining: Math.max(0, 3 - bucket.count) };
}

/** Clear OTP request rate limit on successful verification */
export async function clearOtpRequestRateLimit(phone: string) {
  const { eq } = await import("drizzle-orm");
  await db.delete(rateLimits).where(eq(rateLimits.key, `otp-req:${phone}`));
}

/** Check OTP verification rate limit: max 5 attempts per code */
export async function checkOtpVerifyRateLimit(phone: string): Promise<{ allowed: boolean; remaining: number; error?: string }> {
  const key = `otp-ver:${phone}`;
  const bucket = await incrementRateLimit(key, 5, TWO_MIN);
  
  if (bucket.count > 5) {
    return { allowed: false, remaining: 0, error: "تعداد تلاش برای وارد کردن کد زیاد بود. لطفاً کد جدید درخواست کن." };
  }
  return { allowed: true, remaining: Math.max(0, 5 - bucket.count) };
}

/** Clear OTP verify rate limit on success */
export async function clearOtpVerifyRateLimit(phone: string) {
  const { eq } = await import("drizzle-orm");
  await db.delete(rateLimits).where(eq(rateLimits.key, `otp-ver:${phone}`));
}

/** Check login rate limit for password-based login: 5 attempts per 15 min */
export async function checkLoginRateLimit(phone: string): Promise<{ allowed: boolean; remaining: number; error?: string }> {
  const key = `login:${phone}`;
  const bucket = await incrementRateLimit(key, 5, FIFTEEN_MIN);
  
  if (bucket.count > 5) {
    return { allowed: false, remaining: 0, error: "پس از ۵ تلاش ناموفق، حساب موقتاً قفل شد. ۱۵ دقیقهٔ دیگر دوباره امتحان کن." };
  }
  return { allowed: true, remaining: Math.max(0, 5 - bucket.count) };
}

/** Clear login rate limit on successful password login */
export async function clearLoginRateLimit(phone: string) {
  const { eq } = await import("drizzle-orm");
  await db.delete(rateLimits).where(eq(rateLimits.key, `login:${phone}`));
}

/** Check chat message rate limit: 30 messages per 5 min */
export async function checkChatRateLimit(userId: string): Promise<{ allowed: boolean; error?: string }> {
  const key = `chat:${userId}`;
  const bucket = await incrementRateLimit(key, 30, FIVE_MIN);
  
  if (bucket.count > 30) {
    return { allowed: false, error: "تعداد پیام‌های شما در این بازهٔ زمانی زیاد است. چند دقیقه صبر کن و دوباره تلاش کن." };
  }
  return { allowed: true };
}

/**
 * Send OTP via MeliPayamak's officially-documented SendSMS REST webservice.
 * Docs (official PDF, "راهنمای وب سرویس ارسال Rest"):
 *   POST https://rest.payamak-panel.com/api/SendSMS/SendSMS
 *
 * IMPORTANT: per the official docs, the `password` field for this REST
 * webservice is NOT your normal account login password — it must be an
 * ApiKey generated from پنل ملی‌پیامک → منوی «توسعه‌دهندگان» → تنظیمات
 * وب‌سرویس. Using the regular account password here is what previously
 * caused failures (matches error code -110 below).
 *
 * There is no documented SendOtp method in the official REST guide, so we
 * send a normal SMS with our own OTP text via SendSMS instead.
 *
 * If MeliPayamak blocks requests from this server's IP (common for
 * foreign-hosted apps like Vercel — see melipayamak-relay), set
 * SMS_RELAY_URL + SMS_RELAY_SECRET to route the request through a small
 * relay running on an Iranian host instead of calling MeliPayamak directly.
 */
export async function sendOtpSms(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  const relayUrl = process.env.SMS_RELAY_URL;
  const relaySecret = process.env.SMS_RELAY_SECRET;
  const text = `کد تایید آراما: ${code}`;

  if (relayUrl && relaySecret) {
    try {
      const response = await fetch(relayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-relay-secret": relaySecret,
        },
        body: JSON.stringify({ to: phone, text }),
      });

      const rawText = await response.text();
      let result: { success?: boolean; error?: string; code?: string };
      try {
        result = JSON.parse(rawText);
      } catch {
        console.error(`[SMS relay] Non-JSON response: ${rawText.slice(0, 300)}`);
        return { success: false, error: "پاسخ نامعتبر از سرویس رله دریافت شد." };
      }

      if (result.success) return { success: true };
      console.error(`[SMS relay] Failed: ${JSON.stringify(result)}`);
      return { success: false, error: "ارسال کد تأیید انجام نشد." };
    } catch (err) {
      console.error("[SMS relay] Network error:", err);
      return { success: false, error: "ارتباط با سرویس پیامک برقرار نشد." };
    }
  }

  const username = process.env.MELIPAYAMAK_USERNAME;
  const apiKey = process.env.MELIPAYAMAK_APIKEY; // ApiKey from پنل → توسعه‌دهندگان, NOT your login password
  const from = process.env.MELIPAYAMAK_FROM; // your dedicated sender line number

  if (!username || !apiKey || !from) {
    // In development or missing config, log the code for testing
    console.log(`[MeliPayamak DEV MODE] OTP for ${phone}: ${code}`);
    return { success: true };
  }

  // Error codes documented for SendSMS (RetStatus !== 1 means failure;
  // Value holds the specific code below).
  const ERROR_MESSAGES: Record<string, string> = {
    "0": "نام کاربری یا ApiKey ملی‌پیامک اشتباه است.",
    "2": "اعتبار پنل ملی‌پیامک کافی نیست.",
    "3": "محدودیت ارسال روزانه پنل ملی‌پیامک.",
    "4": "محدودیت حجم ارسال پنل ملی‌پیامک.",
    "5": "شمارهٔ فرستنده (from) معتبر نیست.",
    "6": "سامانهٔ ملی‌پیامک در حال به‌روزرسانی است.",
    "7": "متن پیامک حاوی کلمهٔ فیلترشده است.",
    "9": "ارسال از خطوط عمومی از طریق وب‌سرویس امکان‌پذیر نیست.",
    "10": "کاربر ملی‌پیامک فعال نیست.",
    "11": "پیامک ارسال نشد.",
    "12": "مدارک حساب ملی‌پیامک کامل نیست.",
    "14": "متن پیامک حاوی لینک است.",
    "16": "شمارهٔ گیرنده یافت نشد.",
    "17": "متن پیامک خالی است.",
    "18": "شمارهٔ گیرنده معتبر نیست.",
    "-108": "IP سرور مسدود شده است.",
    "-109": "باید IP مجاز برای API را در پنل ملی‌پیامک تنظیم کنی.",
    "-110": "باید از ApiKey (نه رمز عبور) استفاده کنی — از منوی توسعه‌دهندگان بگیرش.",
    "-111": "IP درخواست‌دهنده نامعتبر است.",
  };

  try {
    const body = new URLSearchParams({
      username,
      password: apiKey, // the "password" field is documented to be the ApiKey
      to: phone,
      from,
      text,
      isFlash: "false",
    });

    const response = await fetch(
      "https://rest.payamak-panel.com/api/SendSMS/SendSMS",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      },
    );

    const rawText = await response.text();

    if (!response.ok) {
      console.error(
        `[MeliPayamak] HTTP ${response.status} ${response.statusText}. Body: ${rawText.slice(0, 500)}`,
      );
      return { success: false, error: "ارسال کد تأیید انجام نشد." };
    }

    let result: { Value?: string; RetStatus?: number; StrRetStatus?: string };
    try {
      result = JSON.parse(rawText) as { Value?: string; RetStatus?: number; StrRetStatus?: string };
    } catch {
      // Not JSON — usually an HTML/XML error page when credentials, IP,
      // or the endpoint itself are wrong. Log the raw body so the real
      // cause shows up in server logs instead of a generic 503.
      console.error(`[MeliPayamak] Non-JSON response: ${rawText.slice(0, 500)}`);
      return { success: false, error: "پاسخ نامعتبر از سرویس پیامک دریافت شد." };
    }

    console.log(`[MeliPayamak] RetStatus: ${result.RetStatus}, Value: ${result.Value}`);

    if (result.RetStatus === 1 && result.StrRetStatus === "Ok") {
      return { success: true };
    }

    const code_ = String(result.Value ?? "");
    return {
      success: false,
      error: ERROR_MESSAGES[code_] || "ارسال کد تأیید انجام نشد.",
    };
  } catch (err) {
    console.error("[MeliPayamak] Network error:", err);
    return { success: false, error: "ارتباط با سرویس پیامک برقرار نشد." };
  }
}
