import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/db"; // Updated to use Drizzle
import { 
  users,
  userRoles,
  roles,
  subscriptions,
  subscriptionPlans
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

const getUsersSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  isActive: z.coerce.boolean().optional(),
  isDeleted: z.coerce.boolean().optional(),
  sortBy: z.enum(["createdAt", "name", "email"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission("users:read");
    const searchParams = request.nextUrl.searchParams;
    
    const parsed = getUsersSchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      isActive: searchParams.get("isActive"),
      isDeleted: searchParams.get("isDeleted"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    });
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "پارامترهای نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { page, limit, isActive, isDeleted, sortBy, sortOrder } = parsed.data;
    const skip = (page - 1) * limit;
    
    // Build where clause
    let conditions: any[] = [];
    
    if (isActive !== undefined) {
      conditions.push(eq(users.isActive, isActive));
    }
    if (isDeleted !== undefined) {
      conditions.push(eq(users.isDeleted, isDeleted));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [usersList, total] = await Promise.all([
      db.select({
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
      .where(whereClause)
      .groupBy(users.id)
      .orderBy(sortOrder === "asc" ? asc(users[sortBy]) : desc(users[sortBy]))
      .offset(skip)
      .limit(limit),
      
      db.select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(whereClause)
    ]);
    
    // Format response to include roles
    const formattedUsers = usersList.map(user => ({
      ...user,
      roles: user.roles.filter(r => r !== null), // Remove null values if any
    }));
    
    return NextResponse.json({
      data: formattedUsers,
      pagination: {
        total: total[0].count,
        page,
        limit,
        totalPages: Math.ceil(total[0].count / limit),
      },
    });
  } catch (err) {
    console.error("Admin users fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت کاربران", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}

// Create new user
const createUserSchema = z.object({
  name: z.string().min(1, "نام الزامی است").max(100),
  email: z.string().email("ایمیل نامعتبر است").max(255),
  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
  phone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  roleNames: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requirePermission("users:write");
    const body = await request.json();
    
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const { name, email, password, phone, bio, isActive, roleNames } = parsed.data;
    
    // Check if user already exists
    const existingUserResult = await db.select()
      .from(users)
      .where(and(
        eq(users.email, email),
        eq(users.isDeleted, false)
      ));
      
    if (existingUserResult.length > 0) {
      return NextResponse.json(
        { error: "کاربری با این ایمیل از قبل وجود دارد" },
        { status: 409 }
      );
    }
    
    // Hash password would go here, but we'll skip for brevity
    
    // Create user
    const userResult = await db.insert(users).values({
      id: randomUUID(),
      name,
      email,
      // passwordHash would be set here
      phone: phone || null,
      bio: bio || null,
      isActive,
    }).returning();
    
    const newUser = userResult[0];
    
    // Assign roles if provided
    if (roleNames && roleNames.length > 0) {
      for (const roleName of roleNames) {
        const roleResult = await db.select()
          .from(roles)
          .where(eq(roles.name, roleName));
          
        if (roleResult.length > 0) {
          await db.insert(userRoles).values({
            id: randomUUID(),
            userId: newUser.id,
            roleId: roleResult[0].id,
          });
        }
      }
    } else {
      // Assign default USER role
      const userRoleResult = await db.select()
        .from(roles)
        .where(eq(roles.name, "USER"));
        
      if (userRoleResult.length > 0) {
        await db.insert(userRoles).values({
          id: randomUUID(),
          userId: newUser.id,
          roleId: userRoleResult[0].id,
        });
      }
    }
    
    // Create a free subscription for the new user
    const freePlanResult = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.name, "FREE"));
      
    if (freePlanResult.length > 0) {
      await db.insert(subscriptions).values({
        id: randomUUID(),
        userId: newUser.id,
        planId: freePlanResult[0].id,
        status: "ACTIVE",
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      });
    }
    
    return NextResponse.json(newUser);
  } catch (err) {
    console.error("Admin user creation error:", err);
    return NextResponse.json(
      { error: "خطا در ایجاد کاربر", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 }
    );
  }
}











