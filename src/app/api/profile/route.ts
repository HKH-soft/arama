import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/prisma"; // Updated to use Drizzle
import { 
  users,
  userRoles,
  roles
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc } from 'drizzle-orm'; // Import Drizzle operators
import { logAudit, getClientInfo } from "@/lib/audit";
import { z } from "zod";
import { randomUUID } from 'crypto';

const updateProfileSchema = z.object({
  name: z.string().min(1, "نام الزامی است").max(100).optional(),
  email: z.string().email("فرمت ایمیل معتبر نیست").max(255).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url("آدرس تصویر نامعتبر است").optional().nullable(),
});

export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get user with roles
    const userResult = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      image: users.image,
      phone: users.phone,
      bio: users.bio,
      avatarUrl: users.avatarUrl,
      isActive: users.isActive,
      isDeleted: users.isDeleted,
      deletedAt: users.deletedAt,
      lastLoginAt: users.lastLoginAt,
      lastLoginIp: users.lastLoginIp,
      failedLoginCount: users.failedLoginCount,
      lockedUntil: users.lockedUntil,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, user.id));

    if (userResult.length === 0) {
      return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
    }

    const userProfile = userResult[0];
    const userRolesResult = await db.select({ name: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user.id));

    // Combine user data with roles
    const result = {
      ...userProfile,
      roles: userRolesResult.map(r => r.name),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json(
      { error: "دریافت اطلاعات پروفایل انجام نشد" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const clientInfo = getClientInfo(request);
    
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUserResult = await db.select()
      .from(users)
      .where(eq(users.id, currentUser.id));

    if (existingUserResult.length === 0) {
      return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
    }

    const existingUser = existingUserResult[0];
    const { name, email, phone, bio, avatarUrl } = parsed.data;

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExistsResult = await db.select()
        .from(users)
        .where(and(
          eq(users.email, email),
          eq(users.isDeleted, false)
        ));

      // Filter out current user from the check
      if (emailExistsResult.some(u => u.id !== currentUser.id)) {
        return NextResponse.json(
          { error: "این ایمیل قبلاً توسط کاربر دیگری استفاده شده است" },
          { status: 409 }
        );
      }
    }

    // Update user
    const updatedUserResult = await db.update(users)
      .set({
        name: name || existingUser.name,
        email: email || existingUser.email,
        phone: phone || existingUser.phone,
        bio: bio || existingUser.bio,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : existingUser.avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, currentUser.id))
      .returning();

    // Log audit
    await logAudit({
      userId: currentUser.id,
      action: "PROFILE_UPDATED",
      entity: "user",
      entityId: currentUser.id,
      metadata: { fields: Object.keys(parsed.data) },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json(updatedUserResult[0]);
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: "به‌روزرسانی پروفایل انجام نشد" },
      { status: 500 }
    );
  }
}

