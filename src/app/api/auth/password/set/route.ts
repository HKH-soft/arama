import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { hashPassword, requireUser } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;
  
  try {
    const body = (await request.json()) as { password?: string };
    const password = body.password?.trim();
    
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "رمز عبور باید دست‌کم ۸ نویسه باشد." },
        { status: 400 },
      );
    }
    
    const passwordHash = hashPassword(password);
    const salt = passwordHash.slice(0, 48);
    
    const [profile] = await db
      .update(profiles)
      .set({
        passwordHash,
        passwordSalt: salt,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, user.userId))
      .returning();
    
    return NextResponse.json({
      message: "رمز عبور با موفقیت تنظیم شد.",
      profile: {
        userId: profile.userId,
        phone: profile.phone,
        name: profile.name,
        hasPassword: true,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "تنظیم رمز عبور انجام نشد." },
      { status: 503 },
    );
  }
}
