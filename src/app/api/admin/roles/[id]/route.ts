import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { 
  roles,
  userRoles,
  permissions,
  rolePermissions
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc, sql } from 'drizzle-orm'; // Import Drizzle operators
import { logAudit, getClientInfo } from "@/lib/audit";
import { z } from "zod";
import { randomUUID } from 'crypto';

const updateRoleSchema = z.object({
  displayName: z.string().min(1, "عنوان نمایشی الزامی است").max(100).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  permissionIds: z.array(z.string()).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requirePermission("roles:read");
    const { id } = await params;

    const roleResult = await db.select()
      .from(roles)
      .where(eq(roles.id, id));
      
    if (roleResult.length === 0) {
      return NextResponse.json(
        { error: "نقش یافت نشد" },
        { status: 404 }
      );
    }
    
    const role = roleResult[0];
    
    // Get permissions for this role
    const rolePermissionsResult = await db.select({
      id: permissions.id,
      name: permissions.name,
      displayName: permissions.displayName,
      description: permissions.description,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, id));
    
    return NextResponse.json({
      ...role,
      permissions: rolePermissionsResult,
    });
  } catch (err) {
    console.error("Admin role fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت نقش", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requirePermission("roles:write");
    const { id } = await params;
    
    const body = await request.json();
    const parsed = updateRoleSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { displayName, description, isActive, permissionIds } = parsed.data;
    
    // Check if role exists
    const existingRoleResult = await db.select()
      .from(roles)
      .where(eq(roles.id, id));
      
    if (existingRoleResult.length === 0) {
      return NextResponse.json(
        { error: "نقش یافت نشد" },
        { status: 404 }
      );
    }
    
    // Update role
    const updatedRoleResult = await db.update(roles)
      .set({
        displayName: displayName || existingRoleResult[0].displayName,
        description: description || existingRoleResult[0].description,
        isActive: isActive !== undefined ? isActive : existingRoleResult[0].isActive,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, id))
      .returning();
    
    const updatedRole = updatedRoleResult[0];
    
    // If permissions are provided, update them
    if (permissionIds) {
      // First, remove all existing permissions for this role
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
      
      // Then add the new permissions
      if (permissionIds.length > 0) {
        const permissionValues = permissionIds.map(permissionId => ({
          id: randomUUID(),
          roleId: id,
          permissionId
        }));
        
        await db.insert(rolePermissions).values(permissionValues);
      }
    }
    
    // Log audit
    const clientInfo = getClientInfo(request);
    await logAudit({
      userId: currentUser.id,
      action: "ROLE_UPDATED",
      entity: "role",
      entityId: id,
      metadata: { updatedFields: Object.keys(parsed.data) },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });
    
    // Get updated permissions for response
    const rolePermissionsResult = await db.select({
      id: permissions.id,
      name: permissions.name,
      displayName: permissions.displayName,
      description: permissions.description,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, id));
    
    return NextResponse.json({
      ...updatedRole,
      permissions: rolePermissionsResult
    });
  } catch (err) {
    console.error("Admin role update error:", err);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی نقش", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requirePermission("roles:write");
    const { id } = await params;

    // Check if role exists
    const existingRoleResult = await db.select()
      .from(roles)
      .where(eq(roles.id, id));
      
    if (existingRoleResult.length === 0) {
      return NextResponse.json(
        { error: "نقش یافت نشد" },
        { status: 404 }
      );
    }
    
    // Don't allow deletion of built-in roles
    if (["SUPER_ADMIN", "ADMIN", "USER"].includes(existingRoleResult[0].name)) {
      return NextResponse.json(
        { error: "حذف نقش‌های داخلی مجاز نیست" },
        { status: 400 }
      );
    }
    
    // Check if users have this role
    const usersWithRoleResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(userRoles)
      .where(eq(userRoles.roleId, id));
      
    if (usersWithRoleResult[0].count > 0) {
      return NextResponse.json(
        { error: "امکان حذف نقش دارای کاربر وجود ندارد" },
        { status: 400 }
      );
    }
    
    // Delete the role
    await db.delete(roles).where(eq(roles.id, id));
    
    return NextResponse.json({ message: "نقش با موفقیت حذف شد" });
  } catch (err) {
    console.error("Admin role deletion error:", err);
    return NextResponse.json(
      { error: "خطا در حذف نقش", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}