import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { 
  roles,
  userRoles,
  permissions,
  rolePermissions
} from "@/db/schema"; // Import Drizzle tables
import { eq, and, asc, desc } from 'drizzle-orm'; // Import Drizzle operators
import { logAudit, getClientInfo } from "@/lib/audit";
import { z } from "zod";
import { randomUUID } from 'crypto';

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

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission("roles:read");
    const searchParams = request.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const isActive = searchParams.get("isActive");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    let conditions: any[] = [];
    
    if (isActive !== null && isActive !== undefined) {
      conditions.push(eq(roles.isActive, isActive === "true"));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Build the order by clause based on the allowed sort fields
    let orderByClause;
    switch (sortBy) {
      case 'createdAt':
        orderByClause = sortOrder === 'asc' ? asc(roles.createdAt) : desc(roles.createdAt);
        break;
      case 'name':
        orderByClause = sortOrder === 'asc' ? asc(roles.name) : desc(roles.name);
        break;
      case 'displayName':
        orderByClause = sortOrder === 'asc' ? asc(roles.displayName) : desc(roles.displayName);
        break;
      default:
        orderByClause = desc(roles.createdAt);
    }
    
    const rolesList = await db.select()
      .from(roles)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(skip);
    
    // Count total roles
    const totalQuery = await db.select({ count: { count: roles.id } })
      .from(roles)
      .where(whereClause);
    const total = totalQuery.length > 0 ? Number(totalQuery[0].count) : 0;
    
    return NextResponse.json({
      data: rolesList,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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