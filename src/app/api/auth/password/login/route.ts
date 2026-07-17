import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import {
  checkLoginRateLimit,
  clearLoginRateLimit,
  isValidIranianPhone,
  verifyPassword,
} from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { phone?: string; password?: string };
    const phone = body.phone?.trim();
    const password = body.password?.trim();
    
    if (!phone || !isValidIranianPhone(phone)) {
      return NextResponse.json(
        { error: "شماره تلفن معتبر نیست." },
        { status: 400 },
      );
    }
    
    if (!password) {
      return NextResponse.json(
        { error: "رمز عبور را وارد کن." },
        { status: 400 },
      );
    }
    
    // Rate limit check
    const rateLimit = checkLoginRateLimit(phone);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.error },
        { status: 429 },
      );
    }
    
    // Find user by phone
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.phone, phone))
      .limit(1);
    
    if (!profile || !profile.passwordHash) {
      return NextResponse.json(
        { error: "شماره تلفن یا رمز عبور درست نیست." },
        { status: 401 },
      );
    }
    
    // Verify password
    if (!verifyPassword(password, profile.passwordHash)) {
      return NextResponse.json(
        { error: "شماره تلفن یا رمز عبور درست نیست." },
        { status: 401 },
      );
    }
    
    // Clear rate limit on success
    clearLoginRateLimit(phone);
    
    // Create session cookie
    const response = NextResponse.json({
      profile: {
        userId: profile.userId,
        phone: profile.phone,
        name: profile.name,
        hasPassword: true,
      },
    });
    
    response.cookies.set("arama-user", profile.userId, {
      httpOnly: true,
      sameSite: "lax",
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
