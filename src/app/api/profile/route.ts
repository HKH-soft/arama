import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
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
  name: z.string().min(1, "نام الزامی است").optional(),
  email: z.string().email("ایمیل نامعتبر است").optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    const userData = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      role: roles.name,
    })
    .from(users)
    .leftJoin(userRoles, eq(users.id, userRoles.userId))
    .leftJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(users.id, user.id));
    
    if (userData.length === 0) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(userData[0]);
  } catch (err) {
    console.error("Profile fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات پروفایل", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const clientInfo = getClientInfo(request);
    
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { name, email } = parsed.data;
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await db.select().from(users).where(
        and(
          eq(users.email, email),
          eq(users.id, user.id) // Not the current user
        )
      ).limit(1);
      
      if (existingUser.length > 0) {
        return NextResponse.json(
          { error: "ایمیل قبلاً توسط کاربر دیگری استفاده شده است" },
          { status: 400 }
        );
      }
    }
    
    const updatedUsers = await db.update(users)
      .set({
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();
    
    // Log audit
    await logAudit({
      userId: user.id,
      action: "PROFILE_UPDATED",
      entity: "user",
      entityId: user.id,
      metadata: { updatedFields: Object.keys(parsed.data) },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });
    
    return NextResponse.json(updatedUsers[0]);
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی پروفایل", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}