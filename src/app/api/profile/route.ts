import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { hashPassword, requireUser } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;
  try {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.userId))
      .limit(1);
    if (!profile) {
      return NextResponse.json({ error: "کاربر یافت نشد." }, { status: 404 });
    }
    return NextResponse.json({
      profile: {
        userId: profile.userId,
        phone: profile.phone,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        timezone: profile.timezone,
        remindersEnabled: profile.remindersEnabled,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "پروفایل فعلاً در دسترس نیست." },
      { status: 503 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const user = requireUser(request);
  if (user instanceof NextResponse) return user;
  try {
    const body = (await request.json()) as {
      name?: string;
      timezone?: string;
      remindersEnabled?: boolean;
      avatarUrl?: string | null;
      currentPassword?: string;
      newPassword?: string;
    };
    const update: Record<string, unknown> = {};

    if (body.name) {
      const name = body.name.trim();
      if (name.length < 2) {
        return NextResponse.json(
          { error: "نام باید دست‌کم دو حرف باشد." },
          { status: 400 },
        );
      }
      update.name = name;
    }

    if (body.timezone) update.timezone = body.timezone;
    if (body.remindersEnabled !== undefined)
      update.remindersEnabled = body.remindersEnabled;
    if (body.avatarUrl !== undefined) update.avatarUrl = body.avatarUrl;

    // Change password flow
    if (body.currentPassword || body.newPassword) {
      if (!body.currentPassword || !body.newPassword) {
        return NextResponse.json(
          { error: "برای تغییر رمز، رمز فعلی و جدید را وارد کن." },
          { status: 400 },
        );
      }
      if (body.newPassword.length < 8) {
        return NextResponse.json(
          { error: "رمز جدید باید دست‌کم ۸ نویسه باشد." },
          { status: 400 },
        );
      }
      const [existing] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, user.userId))
        .limit(1);
      if (!existing) {
        return NextResponse.json(
          { error: "کاربر یافت نشد." },
          { status: 404 },
        );
      }

      // Verify current password using stored hash+salt
      if (!existing.passwordHash) {
        return NextResponse.json(
          { error: "رمز عبوری تنظیم نشده است." },
          { status: 400 },
        );
      }
      const { verifyPassword } = await import("@/lib/auth-helpers");
      if (!verifyPassword(body.currentPassword, existing.passwordHash)) {
        return NextResponse.json(
          { error: "رمز فعلی درست نیست." },
          { status: 403 },
        );
      }
      update.passwordHash = hashPassword(body.newPassword);
    }

    update.updatedAt = new Date();

    const [profile] = await db
      .update(profiles)
      .set(update)
      .where(eq(profiles.userId, user.userId))
      .returning();
    return NextResponse.json({
      profile: {
        userId: profile.userId,
        phone: profile.phone,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        timezone: profile.timezone,
        remindersEnabled: profile.remindersEnabled,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "ذخیرهٔ تنظیمات انجام نشد." },
      { status: 500 },
    );
  }
}
