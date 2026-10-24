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
        hasPassword: Boolean(profile.passwordHash),
        createdAt: profile.createdAt,
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
      email?: string | null;
      timezone?: string;
      remindersEnabled?: boolean;
      avatarUrl?: string | null;
      currentPassword?: string;
      newPassword?: string;
    };
    const update: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const name = body.name.trim();
      if (name.length < 2 || name.length > 60) {
        return NextResponse.json(
          { error: "نام باید بین ۲ تا ۶۰ نویسه باشد." },
          { status: 400 },
        );
      }
      update.name = name;
    }

    if (body.email !== undefined) {
      const email = body.email ? body.email.trim() : null;
      if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120)) {
        return NextResponse.json(
          { error: "فرمت ایمیل نامعتبر است." },
          { status: 400 },
        );
      }
      update.email = email;
    }

    if (body.timezone && typeof body.timezone === "string" && body.timezone.length <= 50) {
      update.timezone = body.timezone;
    }
    if (body.remindersEnabled !== undefined) {
      update.remindersEnabled = Boolean(body.remindersEnabled);
    }
    if (body.avatarUrl !== undefined) {
      update.avatarUrl = body.avatarUrl && typeof body.avatarUrl === "string" ? body.avatarUrl.slice(0, 500) : null;
    }

    // Password set or change flow
    if (body.newPassword) {
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

      // If user already has a password set, require and verify current password
      if (existing.passwordHash) {
        if (!body.currentPassword) {
          return NextResponse.json(
            { error: "برای تغییر رمز، وارد کردن رمز فعلی الزامی است." },
            { status: 400 },
          );
        }
        const { verifyPassword } = await import("@/lib/auth-helpers");
        if (!(await verifyPassword(body.currentPassword, existing.passwordHash))) {
          return NextResponse.json(
            { error: "رمز فعلی درست نیست." },
            { status: 403 },
          );
        }
      }
      update.passwordHash = await hashPassword(body.newPassword);
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
        hasPassword: Boolean(profile.passwordHash),
        createdAt: profile.createdAt,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "ذخیرهٔ تنظیمات انجام نشد." },
      { status: 500 },
    );
  }
}
