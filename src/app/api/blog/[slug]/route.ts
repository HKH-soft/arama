import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { blogPosts, blogCategories } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    // Increment view count
    await db
      .update(blogPosts)
      .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
      .where(eq(blogPosts.slug, slug));

    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        coverImage: blogPosts.coverImage,
        authorName: blogPosts.authorName,
        authorAvatar: blogPosts.authorAvatar,
        tags: blogPosts.tags,
        readTime: blogPosts.readTime,
        viewCount: blogPosts.viewCount,
        publishedAt: blogPosts.publishedAt,
        createdAt: blogPosts.createdAt,
        categoryName: blogCategories.name,
        categorySlug: blogCategories.slug,
        categoryColor: blogCategories.color,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (posts.length === 0) {
      return NextResponse.json({ error: "مقاله یافت نشد" }, { status: 404 });
    }

    return NextResponse.json(posts[0]);
  } catch (err) {
    console.error("Blog post fetch error:", err);
    return NextResponse.json(
      {
        error: "خطا در دریافت مقاله",
        details: err instanceof Error ? err.message : "خطای ناشناخته",
      },
      { status: 500 },
    );
  }
}
