import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { 
  roles,
  permissions,
  rolePermissions
} from "@/db/schema"; // Import Drizzle tables
import { 
  eq, 
  and, 
  asc, 
  desc, 
  gte, 
  lte,
  sql,
  ilike
} from 'drizzle-orm'; // Import Drizzle operators
import { z } from "zod";
import { randomUUID } from 'crypto';

const getRolesSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(["createdAt", "name", "displayName"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission("roles:read");
    const searchParams = request.nextUrl.searchParams;
    
    const parsed = getRolesSchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      isActive: searchParams.get("isActive"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    });
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "پارامترهای نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { page, limit, isActive, sortBy, sortOrder } = parsed.data;
    const skip = (page - 1) * limit;
    
    // Build where clause
    let conditions: any[] = [];
    
    if (isActive !== undefined) {
      conditions.push(eq(roles.isActive, isActive));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [rolesList, total] = await Promise.all([
      db.select({
        id: roles.id,
        name: roles.name,
        displayName: roles.displayName,
        description: roles.description,
        isActive: roles.isActive,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
        permissions: sql<string[]>`array_agg(${permissions.name})`.as('permissions')
      })
      .from(roles)
      .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
      .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(whereClause)
      .groupBy(roles.id)
      .orderBy(sortOrder === "asc" ? asc(roles[sortBy]) : desc(roles[sortBy]))
      .offset(skip)
      .limit(limit),
      
      db.select({ count: sql<number>`count(*)::int` })
        .from(roles)
        .where(whereClause)
    ]);
    
    // Format response to include permissions
    const formattedRoles = rolesList.map(role => ({
      ...role,
      permissions: role.permissions.filter(p => p !== null), // Remove null values if any
    }));
    
    return NextResponse.json({
      data: formattedRoles,
      pagination: {
        total: total[0].count,
        page,
        limit,
        totalPages: Math.ceil(total[0].count / limit),
      },
    });
  } catch (err) {
    console.error("Admin roles fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت نقش‌ها", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}

// Create new role
const createRoleSchema = z.object({
  name: z.string().min(1, "نام الزامی است").max(100),
  displayName: z.string().min(1, "عنوان نمایشی الزامی است").max(100),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  permissionIds: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requirePermission("roles:write");
    const body = await request.json();
    
    const parsed = createRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { name, displayName, description, isActive, permissionIds } = parsed.data;
    
    // Check if role name already exists
    const existingRoleResult = await db.select()
      .from(roles)
      .where(eq(roles.name, name));
      
    if (existingRoleResult.length > 0) {
      return NextResponse.json(
        { error: "نقش با این نام از قبل وجود دارد" },
        { status: 409 }
      );
    }
    
    // Create role
    const roleResult = await db.insert(roles).values({
      id: randomUUID(),
      name,
      displayName,
      description: description || null,
      isActive,
    }).returning();
    
    const newRole = roleResult[0];
    
    // If permissions are provided, assign them to the role
    if (permissionIds && permissionIds.length > 0) {
      const permissionValues = permissionIds.map(permissionId => ({
        id: randomUUID(),
        roleId: newRole.id,
        permissionId
      }));
      
      await db.insert(rolePermissions).values(permissionValues);
    }
    
    return NextResponse.json(newRole);
  } catch (err) {
    console.error("Admin role creation error:", err);
    return NextResponse.json(
      { error: "خطا در ایجاد نقش", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}