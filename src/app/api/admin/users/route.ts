import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-helpers";
import db from "@/lib/db";
import { users } from "@/db/schema";
import { asc, desc, ilike, sql, and, eq } from "drizzle-orm";
import { z } from "zod";

const getUsersSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(["createdAt", "lastLoginAt", "name", "email"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    await requirePermission("users:read");

    const searchParams = request.nextUrl.searchParams;
    const parsed = getUsersSchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search") || undefined,
      isActive: searchParams.get("isActive"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "پارامترهای نامعتبر", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { page, limit, search, isActive, sortBy, sortOrder } = parsed.data;
    const skip = (page - 1) * limit;

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
      db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        isActive: users.isActive,
        isDeleted: users.isDeleted,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
        role: users.role,
      })
        .from(users)
        .where(whereClause)
        .orderBy(orderByClause)
        .offset(skip)
        .limit(limit),
      db.select({ count: sql<number>`count(*)::int` }).from(users).where(whereClause),
    ]);

    return NextResponse.json({
      data: rows.map((user) => ({
        ...user,
        roles: [user.role || "user"],
      })),
      pagination: {
        total: totalQuery[0]?.count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((totalQuery[0]?.count ?? 0) / limit),
      },
    });
  } catch (err) {
    console.error("Admin users fetch error:", err);
    return NextResponse.json(
      { error: "خطا در دریافت کاربران", details: err instanceof Error ? err.message : "خطای ناشناخته" },
      { status: 500 },
    );
  }
}