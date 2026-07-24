import { and, eq, gt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { otpCodes, profiles } from "@/db/schema";
import {
  checkOtpVerifyRateLimit,
  clearOtpRequestRateLimit,
  clearOtpVerifyRateLimit,
  isValidIranianPhone,
  verifyOtpCode,
} from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { phone?: string; code?: string };
    const phone = body.phone?.trim();
    const code = body.code?.trim();
    
    if (!phone || !isValidIranianPhone(phone)) {
      return NextResponse.json(
        { error: "شماره تلفن معتبر نیست." },
        { status: 400 },
      );
    }
    
    if (!code || !/^\d{5}$/.test(code)) {
      return NextResponse.json(
        { error: "کد تأیید باید ۵ رقم باشد." },
        { status: 400 },
      );
    }
    
    // Rate limit check
    const rateLimit = checkOtpVerifyRateLimit(phone);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.error },
        { status: 429 },
      );
    }
    
    // Find valid OTP code
    const now = new Date();
    const [otpRecord] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.phone, phone),
          gt(otpCodes.expiresAt, now),
          eq(otpCodes.used, false),
        ),
      )
      .limit(1);
    
    if (!otpRecord) {
      return NextResponse.json(
        { error: "کد تأیید منقضی شده یا نامعتبر است." },
        { status: 400 },
      );
    }
    
    // Increment attempts
    await db
      .update(otpCodes)
      .set({ attempts: otpRecord.attempts + 1 })
      .where(eq(otpCodes.id, otpRecord.id));
    
    // Verify code
    if (!verifyOtpCode(code, otpRecord.codeHash)) {
      if (otpRecord.attempts + 1 >= 5) {
        // Invalidate this code after max attempts
        await db
          .update(otpCodes)
          .set({ used: true })
          .where(eq(otpCodes.id, otpRecord.id));
      }
      return NextResponse.json(
        { error: "کد وارد شده درست نیست." },
        { status: 401 },
      );
    }
    
    // Mark code as used
    await db
      .update(otpCodes)
      .set({ used: true })
      .where(eq(otpCodes.id, otpRecord.id));
    
    // Clear rate limits
    clearOtpRequestRateLimit(phone);
    clearOtpVerifyRateLimit(phone);
    
    // Find or create user profile
    let [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.phone, phone))
      .limit(1);
    
    let isNewUser = false;
    if (!profile) {
      isNewUser = true;
      const userId = `user-${crypto.randomUUID()}`;
      [profile] = await db
        .insert(profiles)
        .values({
          userId,
          phone,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
    }
    
    // Create session cookie
    const response = NextResponse.json({
      profile: {
        userId: profile.userId,
        phone: profile.phone,
        name: profile.name,
        hasPassword: !!profile.passwordHash,
        isNewUser,
      },
    });
    
    response.cookies.set("arama-user", profile.userId, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    
    return response;
  } catch {
    return NextResponse.json(
      { error: "ارتباط با سرور برقرار نشد. دوباره امتحان کن." },
      { status: 503 },
    );
  }
}
