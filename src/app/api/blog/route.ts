import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { blogPosts, blogCategories } from "@/db/schema";
import { eq, desc, and, sql, like, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const featured = searchParams.get("featured");
    const offset = (page - 1) * limit;

    const conditions = [eq(blogPosts.isPublished, true)];

    if (category) {
      const cat = await db
        .select()
        .from(blogCategories)
        .where(eq(blogCategories.slug, category))
        .limit(1);
      if (cat.length > 0) {
        conditions.push(eq(blogPosts.categoryId, cat[0].id));
      }
    }

    if (tag) {
      conditions.push(sql`json_each.value = ${tag}`);
    }

    if (search) {
      conditions.push(
        or(
          like(blogPosts.title, `%${search}%`),
          like(blogPosts.excerpt, `%${search}%`),
        )!,
      );
    }

    if (featured === "true") {
      conditions.push(eq(blogPosts.isFeatured, true));
    }

    const whereClause = and(...conditions);

    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        coverImage: blogPosts.coverImage,
        authorName: blogPosts.authorName,
        authorAvatar: blogPosts.authorAvatar,
        tags: blogPosts.tags,
        readTime: blogPosts.readTime,
        isFeatured: blogPosts.isFeatured,
        publishedAt: blogPosts.publishedAt,
        categoryName: blogCategories.name,
        categorySlug: blogCategories.slug,
        categoryColor: blogCategories.color,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(whereClause)
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(whereClause);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error("Blog fetch error:", err);
    return NextResponse.json(
      {
        error: "خطا در دریافت مقالات",
        details: err instanceof Error ? err.message : "خطای ناشناخته",
      },
      { status: 500 },
    );
  }
}
