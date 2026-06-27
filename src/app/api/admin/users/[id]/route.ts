import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/prisma"; // Updated to use Drizzle
import { 
  users,
  userRoles,
  roles,
  subscriptions,
  subscriptionPlans
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc, sql, inArray } from 'drizzle-orm'; // Import Drizzle operators
import { logAudit, getClientInfo } from "@/lib/audit";
import { z } from "zod";
import { randomUUID } from 'crypto';

const updateUserSchema = z.object({
  name: z.string().min(1, "نام الزامی است").max(100).optional(),
  email: z.string().email("ایمیل نامعتبر است").max(255).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  roleNames: z.array(z.string()).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission("users:read");
    const { id } = await params;

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
      roles: sql<string[]>`array_agg(${roles.name})`.as('roles')
    })
    .from(users)
    .leftJoin(userRoles, eq(users.id, userRoles.userId))
    .leftJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(users.id, id))
    .groupBy(users.id);
    
    if (userResult.length === 0) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 }
      );
    }
    
    const userData = userResult[0];
    
    return NextResponse.json({
      ...userData,
      roles: userData.roles.filter(r => r !== null)
    });
  } catch (err) {
    console.error("Admin user fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت کاربر", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requirePermission("users:write");
    const { id } = await params;
    
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { name, email, isActive, isDeleted, roleNames } = parsed.data;
    
    // Check if user exists
    const existingUserResult = await db.select()
      .from(users)
      .where(eq(users.id, id));
      
    if (existingUserResult.length === 0) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 }
      );
    }
    
    // Update user
    const updatedUserResult = await db.update(users)
      .set({
        name: name || existingUserResult[0].name,
        email: email || existingUserResult[0].email,
        isActive: isActive !== undefined ? isActive : existingUserResult[0].isActive,
        isDeleted: isDeleted !== undefined ? isDeleted : existingUserResult[0].isDeleted,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    const updatedUser = updatedUserResult[0];
    
    // If roles are provided, update them
    if (roleNames) {
      // First, remove all existing roles for this user
      await db.delete(userRoles).where(eq(userRoles.userId, id));
      
      // Then add the new roles
      if (roleNames.length > 0) {
        // Convert role names to role IDs
        const roleResults = await db.select({ id: roles.id })
          .from(roles)
          .where(and(
            inArray(roles.name, roleNames),
            eq(roles.isActive, true)
          ));
        
        const roleIds = roleResults.map(role => role.id);
        
        if (roleIds.length > 0) {
          const roleValues = roleIds.map(roleId => ({
            id: randomUUID(),
            userId: id,
            roleId: roleId
          }));
          
          await db.insert(userRoles).values(roleValues);
        }
      }
    }
    
    // Log audit
    const clientInfo = getClientInfo(request);
    await logAudit({
      userId: currentUser.id,
      action: "USER_UPDATED",
      entity: "user",
      entityId: id,
      metadata: { updatedFields: Object.keys(parsed.data) },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });
    
    // Return the updated user with its roles
    const userWithRoles = await db.select({
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
      roles: sql<string[]>`array_agg(${roles.name})`.as('roles')
    })
    .from(users)
    .leftJoin(userRoles, eq(users.id, userRoles.userId))
    .leftJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(users.id, id))
    .groupBy(users.id);
    
    return NextResponse.json({
      ...userWithRoles[0],
      roles: userWithRoles[0].roles.filter(r => r !== null)
    });
  } catch (err) {
    console.error("Admin user update error:", err);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی کاربر", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requirePermission("users:write");
    const { id } = await params;

    // Check if user exists
    const existingUserResult = await db.select()
      .from(users)
      .where(eq(users.id, id));
      
    if (existingUserResult.length === 0) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 }
      );
    }
    
    // Don't allow deletion of super admins
    const userRolesResult = await db.select()
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(
        eq(userRoles.userId, id),
        eq(roles.name, "SUPER_ADMIN")
      ));
      
    if (userRolesResult.length > 0) {
      return NextResponse.json(
        { error: "حذف کاربران سوپر ادمین مجاز نیست" },
        { status: 400 }
      );
    }
    
    // Delete the user (soft delete by setting isDeleted flag)
    await db.update(users).set({
      isDeleted: true,
      deletedAt: new Date(),
      isActive: false,
    }).where(eq(users.id, id));
    
    return NextResponse.json({ message: "کاربر با موفقیت حذف شد" });
  } catch (err) {
    console.error("Admin user deletion error:", err);
    return NextResponse.json(
      { error: "خطا در حذف کاربر", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}











