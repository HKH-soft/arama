import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/db";
import { users } from "@/db/schema";
import { asc, desc, ilike, sql, and, eq, count } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";
import { preprocessBoolean } from "@/lib/validators/admin";
import { logAudit, getClientInfo } from "@/lib/audit";
import { isUniqueViolation, currentTimestamp } from "@/db/driver-helpers";

const getUsersSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  search: z.string().optional(),
  isActive: preprocessBoolean(),
  sortBy: z.enum(["createdAt", "lastLoginAt", "name", "email"]).optional().transform(val => val ?? "createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().transform(val => val ?? "desc"),
});

const createUserSchema = z.object({
  name: z.string().min(1, "نام الزامی است"),
  email: z.string().email("ایمیل نامعتبر است"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
  role: z.enum(["user", "admin", "super_admin"]).default("user"),
  isActive: z.boolean().default(true),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["user", "admin", "super_admin"]).optional(),
  isActive: z.boolean().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission("users:read");

    // Log for debugging
    console.log("User accessing users API:", user?.email, "with roles:", user?.roles);

    const searchParams = request.nextUrl.searchParams;
    const parsed = getUsersSchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      isActive: searchParams.get("isActive") ?? undefined,
      sortBy: searchParams.get("sortBy") ?? undefined,
      sortOrder: searchParams.get("sortOrder") ?? undefined,
    });

    if (!parsed.success) {
      console.log("Validation error:", parsed.error.issues);
      return NextResponse.json(
        { error: "پارامترهای نامعتبر", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { page, limit: pageLimit, search, isActive, sortBy, sortOrder } = parsed.data;
    const skip = (page - 1) * pageLimit;

    const conditions: any[] = [];
    if (search) {
      conditions.push(
        sql`(${ilike(users.name, `%${search}%`)} OR ${ilike(users.email, `%${search}%`)})`,
      );
    }
    if (isActive !== undefined) {
      conditions.push(eq(users.isActive, isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const orderByClause = sortOrder === "asc" ? asc(users[sortBy]) : desc(users[sortBy]);

    const [rows, totalQuery] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          isActive: users.isActive,
          isDeleted: users.isDeleted,
          createdAt: users.createdAt,
          lastLoginAt: users.lastLoginAt,
          role: users.role,
          phone: users.phone,
          bio: users.bio,
          emailVerified: users.emailVerified,
        })
        .from(users)
        .where(whereClause)
        .orderBy(orderByClause)
        .offset(skip)
        .limit(pageLimit),
      db.select({ count: count() }).from(users).where(whereClause),
    ]);

    const total = totalQuery[0]?.count ?? 0;

    return NextResponse.json({
      data: rows.map((user) => ({
        ...user,
        roles: [user.role || "user"],
      })),
      pagination: {
        total,
        page,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit),
      },
    });
  } catch (err: any) {
    console.error("Admin users fetch error:", err);
    if (err?.message?.includes("احراز هویت") || err?.message?.includes("ممنوع")) {
      return NextResponse.json(
        { error: err.message },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: "خطا در دریافت کاربران", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 400 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requirePermission("users:write");
    const clientInfo = await getClientInfo(request);

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { name, email, password, role, isActive, phone, bio } = parsed.data;

    // Hash password using better-sqlite3 compatible approach
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db
      .insert(users)
      .values({
        id: randomUUID(),
        name,
        email,
        role,
        isActive,
        phone: phone ?? null,
        bio: bio ?? null,
        emailVerified: false,
      })
      .returning();

    await logAudit({
      userId: adminUser.id,
      action: "USER_CREATED",
      entity: "user",
      entityId: newUser[0].id,
      metadata: { email, role },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (err: any) {
    console.error("Admin user creation error:", err);
    if (isUniqueViolation(err)) {
      return NextResponse.json(
        { error: "کاربری با این ایمیل قبلاً ثبت شده است" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "خطا در ایجاد کاربر", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminUser = await requirePermission("users:write");
    const clientInfo = await getClientInfo(request);

    const body = await request.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json(
        { error: "شناسه کاربر الزامی است" },
        { status: 400 },
      );
    }

    const parsed = updateUserSchema.safeParse(updateFields);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "ورودی نامعتبر", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, id));
    if (existing.length === 0) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 },
      );
    }

    const updateData: Record<string, any> = {
      ...parsed.data,
      updatedAt: currentTimestamp,
    };

    const updated = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    await logAudit({
      userId: adminUser.id,
      action: "USER_UPDATED",
      entity: "user",
      entityId: id,
      metadata: { updatedFields: Object.keys(parsed.data) },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json(updated[0]);
  } catch (err: any) {
    console.error("Admin user update error:", err);
    if (isUniqueViolation(err)) {
      return NextResponse.json(
        { error: "این ایمیل قبلاً توسط کاربر دیگری استفاده شده است" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی کاربر", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await requirePermission("users:write");
    const clientInfo = await getClientInfo(request);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "شناسه کاربر الزامی است" },
        { status: 400 },
      );
    }

    const existing = await db
      .select({ id: users.id, role: users.role, email: users.email })
      .from(users)
      .where(eq(users.id, id));
    if (existing.length === 0) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 },
      );
    }

    await db.delete(users).where(eq(users.id, id));

    await logAudit({
      userId: adminUser.id,
      action: "USER_DELETED",
      entity: "user",
      entityId: id,
      metadata: { deletedEmail: existing[0].email, deletedRole: existing[0].role },
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    });

    return NextResponse.json({ message: "کاربر با موفقیت حذف شد" });
  } catch (err) {
    console.error("Admin user delete error:", err);
    return NextResponse.json(
      { error: "خطا در حذف کاربر", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 },
    );
  }
}