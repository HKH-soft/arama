/**
 * MelliPayamak (سامانه ملی پیامک) SMS OTP Service
 * REST API: https://rest.payamak-panel.com/api/SendSMS/SendSMS
 */

const MELLIPAYAMAK_API = "https://rest.payamak-panel.com/api/SendSMS/SendSMS";

function getCredentials() {
  return {
    username: process.env.MELLIPAYAMAK_USERNAME?.trim() || "09934625945",
    password: process.env.MELLIPAYAMAK_API_KEY?.trim() || "c7bf6eb9-e3c0-4914-9b4f-06b9b5b52a85",
    from: process.env.MELLIPAYAMAK_FROM?.trim() || "50004001462594",
    bodyId: process.env.MELLIPAYAMAK_BODY_ID?.trim() || "543305",
  };
}

// In-memory OTP store: phone → { code, expiresAt, attempts }
type OtpRecord = {
  code: string;
  expiresAt: number;
  attempts: number;
  sentAt: number;
};

const otpStore = new Map<string, OtpRecord>();

// Cleanup expired OTPs periodically
function cleanupExpired() {
  const now = Date.now();
  for (const [key, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(key);
    }
  }
}

const OTP_TTL_MS = 2 * 60 * 1000; // 2 minutes
const OTP_COOLDOWN_MS = 60 * 1000; // 60 seconds between sends
const MAX_VERIFY_ATTEMPTS = 5;

export function generateOtp(): string {
  // 5-digit random code (10000-99999)
  return String(Math.floor(10000 + Math.random() * 90000));
}

export function canSendOtp(phone: string): { allowed: boolean; waitSeconds?: number } {
  const existing = otpStore.get(phone);
  if (existing) {
    const elapsed = Date.now() - existing.sentAt;
    if (elapsed < OTP_COOLDOWN_MS) {
      return { allowed: false, waitSeconds: Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000) };
    }
  }
  return { allowed: true };
}

export async function sendOtp(phone: string): Promise<{ ok: boolean; error?: string; waitSeconds?: number }> {
  // Cleanup if store grows
  if (otpStore.size > 500) cleanupExpired();

  // Check cooldown
  const cooldown = canSendOtp(phone);
  if (!cooldown.allowed) {
    return { ok: false, error: `لطفاً ${cooldown.waitSeconds} ثانیه صبر کنید.`, waitSeconds: cooldown.waitSeconds };
  }

  const code = generateOtp();
  const { username, password, from, bodyId } = getCredentials();
  const message = `آراما\nکد تأیید: ${code}\nاین کد تا ۲ دقیقه معتبر است.`;

  try {
    let success = false;
    let recId = "";

    // 1. If bodyId is configured (Pattern / Shared Service Line — bypasses telecom blacklists)
    if (bodyId) {
      try {
        const patternParams = new URLSearchParams();
        patternParams.append("username", username);
        patternParams.append("password", password);
        patternParams.append("to", phone);
        patternParams.append("bodyId", bodyId);
        patternParams.append("text", code);

        const pRes = await fetch("https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: patternParams,
          signal: AbortSignal.timeout(10_000),
        });
        const pData = await pRes.json().catch(() => ({}));
        if (pData.RetStatus === 1 || (pData.Value && String(pData.Value).length > 2)) {
          success = true;
          recId = String(pData.Value);
          console.log(`[SMS:Pattern] OTP sent via service line to ${phone.slice(0, 4)}***${phone.slice(-4)} | RecID: ${recId}`);
        } else {
          console.warn("[SMS:Pattern] Failed, falling back to standard send:", pData);
        }
      } catch (pErr) {
        console.warn("[SMS:Pattern] Error, falling back to standard send:", pErr);
      }
    }

    // 2. Standard SendSMS (via dedicated line)
    if (!success) {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);
      if (from) params.append("from", from);
      params.append("to", phone);
      params.append("text", message);
      params.append("isflash", "false");

      const res = await fetch(MELLIPAYAMAK_API, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
        signal: AbortSignal.timeout(10_000),
      });

      const data = await res.json().catch(() => ({}));
      if (data.RetStatus === 1 || (data.Value && String(data.Value).length > 2)) {
        success = true;
        recId = String(data.Value);
        console.log(`[SMS:Standard] OTP sent to ${phone.slice(0, 4)}***${phone.slice(-4)} | RecID: ${recId}`);
      } else {
        console.error("[SMS:Standard] MelliPayamak error response:", data);
      }
    }

    if (success) {
      if (process.env.NODE_ENV !== "production") {
        console.log(`[DEV OTP Code for ${phone}]: ${code}`);
      }
      // Store OTP
      otpStore.set(phone, {
        code,
        expiresAt: Date.now() + OTP_TTL_MS,
        attempts: 0,
        sentAt: Date.now(),
      });
      return { ok: true };
    }

    return { ok: false, error: "ارسال پیامک با خطا مواجه شد. لطفاً دوباره تلاش کنید." };
  } catch (err) {
    console.error("[SMS] Send error:", err);
    return { ok: false, error: "ارسال پیامک با خطا مواجه شد. لطفاً دوباره تلاش کنید." };
  }
}

export function verifyOtp(phone: string, code: string): { valid: boolean; error?: string } {
  const record = otpStore.get(phone);

  if (!record) {
    return { valid: false, error: "کد تأیید منقضی شده یا ارسال نشده است. لطفاً دوباره درخواست کنید." };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, error: "کد تأیید منقضی شده. لطفاً کد جدید درخواست کنید." };
  }

  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    otpStore.delete(phone);
    return { valid: false, error: "تعداد تلاش‌ها بیش از حد مجاز. لطفاً کد جدید درخواست کنید." };
  }

  record.attempts += 1;

  if (record.code !== code) {
    return { valid: false, error: "کد تأیید اشتباه است." };
  }

  // Success — consume the OTP
  otpStore.delete(phone);
  return { valid: true };
}

export function checkOtpOnly(phone: string, code: string): { valid: boolean; error?: string } {
  const record = otpStore.get(phone);
  if (!record) {
    return { valid: false, error: "کد تأیید منقضی شده یا هنوز ارسال نشده است." };
  }
  if (Date.now() > record.expiresAt) {
    return { valid: false, error: "کد تأیید منقضی شده است. کد جدید درخواست کنید." };
  }
  if (record.code !== code) {
    return { valid: false, error: "کد تأیید اشتباه است." };
  }
  return { valid: true };
}

