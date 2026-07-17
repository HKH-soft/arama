import { eq, gt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { otpCodes, profiles } from "@/db/schema";
import {
  checkOtpRequestRateLimit,
  generateOtpCode,
  hashOtpCode,
  isValidIranianPhone,
  sendOtpSms,
} from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { phone?: string };
    const phone = body.phone?.trim();
    
    if (!phone || !isValidIranianPhone(phone)) {
      return NextResponse.json(
        { error: "شماره تلفن معتبر نیست. فرمت صحیح: 09xxxxxxxxx" },
        { status: 400 },
      );
    }
    
    // Rate limit check
    const rateLimit = checkOtpRequestRateLimit(phone);
    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        { error: rateLimit.error },
        { status: 429 },
      );
      if (rateLimit.retryAfter) {
        response.headers.set("Retry-After", String(rateLimit.retryAfter));
      }
      return response;
    }
    
    // Invalidate any existing unused codes for this phone
    const now = new Date();
    await db
      .delete(otpCodes)
      .where(
        eq(otpCodes.phone, phone),
      );
    
    // Generate and store new OTP
    const code = generateOtpCode();
    const codeHash = hashOtpCode(code);
    const expiresAt = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes
    
    await db.insert(otpCodes).values({
      phone,
      codeHash,
      expiresAt,
      attempts: 0,
      used: false,
    });
    
    // Send SMS via MeliPayamak
    const smsResult = await sendOtpSms(phone, code);
    if (!smsResult.success) {
      return NextResponse.json(
        { error: smsResult.error || "ارسال کد تأیید انجام نشد." },
        { status: 503 },
      );
    }
    
    return NextResponse.json({
      message: "کد تأیید ارسال شد.",
      expiresAt: expiresAt.toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "ارتباط با سرور برقرار نشد. دوباره امتحان کن." },
      { status: 503 },
    );
  }
}
