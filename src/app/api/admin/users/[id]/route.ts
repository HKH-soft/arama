import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
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

const updateUserSchema = z.object({
  name: z.string().min(1, "نام الزامی است").optional(),
  email: z.string().email("ایمیل نامعتبر است").optional(),
  isActive: z.boolean().optional(),
  roleId: z.string().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params;
    const user = await requirePermission("users:read");
    
    const userResult = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      role: roles.name,
    })
    .from(users)
    .leftJoin(userRoles, eq(users.id, userRoles.userId))
    .leftJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(users.id, awaitedParams.id));
    
    if (userResult.length === 0) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(userResult[0]);
  } catch (err) {
    console.error("Admin user fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات کاربر", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params;
    const user = await requirePermission("users:write");
    const clientInfo = getClientInfo(request);
    
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { name, email, isActive, roleId } = parsed.data;
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, awaitedParams.id)).limit(1);
    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 }
      );
    }
    
    // Update user
    const updatedUsers = await db.update(users)
      .set({
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, awaitedParams.id))
      .returning();
    
    // Update user role if provided
    if (roleId) {
      // First delete existing role
      await db.delete(userRoles).where(eq(userRoles.userId, awaitedParams.id));
      
      // Then insert new role
      await db.insert(userRoles).values({
        id: randomUUID(), // Add the required id field
        userId: awaitedParams.id,
        roleId: roleId,
      });
    }
    
    // Log audit
    await logAudit({
      userId: user.id,
      action: "USER_UPDATED",
      entity: "user",
      entityId: awaitedParams.id,
      metadata: { updatedFields: Object.keys(parsed.data) },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });
    
    return NextResponse.json(updatedUsers[0]);
  } catch (err) {
    console.error("Admin user update error:", err);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی کاربر", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const awaitedParams = await params;
    const user = await requirePermission("users:delete");
    const clientInfo = getClientInfo(request);
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, awaitedParams.id)).limit(1);
    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 }
      );
    }
    
    // Delete user (soft delete by setting active to false, or hard delete depending on requirements)
    await db.delete(users).where(eq(users.id, awaitedParams.id));
    
    // Log audit
    await logAudit({
      userId: user.id,
      action: "USER_DELETED",
      entity: "user",
      entityId: awaitedParams.id,
      metadata: { deletedBy: user.id },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });
    
    return NextResponse.json({ message: "کاربر با موفقیت حذف شد" });
  } catch (err) {
    console.error("Admin user deletion error:", err);
    return NextResponse.json(
      { error: "خطا در حذف کاربر", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}