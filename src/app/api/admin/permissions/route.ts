import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { 
  permissions
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

const getPermissionsSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(["createdAt", "name", "displayName"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission("permissions:read");
    const searchParams = request.nextUrl.searchParams;
    
    const parsed = getPermissionsSchema.safeParse({
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
      conditions.push(eq(permissions.isActive, isActive));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [permissionsList, total] = await Promise.all([
      db.select()
        .from(permissions)
        .where(whereClause)
        .orderBy(sortOrder === "asc" ? asc(permissions[sortBy]) : desc(permissions[sortBy]))
        .offset(skip)
        .limit(limit),
      db.select({ count: sql<number>`count(*)::int` })
        .from(permissions)
        .where(whereClause)
    ]);
    
    return NextResponse.json({
      data: permissionsList,
      pagination: {
        total: total[0].count,
        page,
        limit,
        totalPages: Math.ceil(total[0].count / limit),
      },
    });
  } catch (err) {
    console.error("Admin permissions fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت مجوزها", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}

// Create new permission
const createPermissionSchema = z.object({
  name: z.string().min(1, "نام الزامی است").max(100),
  displayName: z.string().min(1, "عنوان نمایشی الزامی است").max(100),
  description: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requirePermission("permissions:write");
    const body = await request.json();
    
    const parsed = createPermissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { name, displayName, description } = parsed.data;
    
    // Check if permission name already exists
    const existingPermissionResult = await db.select()
      .from(permissions)
      .where(eq(permissions.name, name));
      
    if (existingPermissionResult.length > 0) {
      return NextResponse.json(
        { error: "مجوز با این نام از قبل وجود دارد" },
        { status: 409 }
      );
    }
    
    // Create permission
    const permissionResult = await db.insert(permissions).values({
      id: crypto.randomUUID(),
      name,
      displayName,
      description: description || null,
    }).returning();
    
    return NextResponse.json(permissionResult[0]);
  } catch (err) {
    console.error("Admin permission creation error:", err);
    return NextResponse.json(
      { error: "خطا در ایجاد مجوز", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}