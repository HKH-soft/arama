import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { blogPosts, blogCategories } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

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
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true)))
      .limit(1);

    if (posts.length === 0) {
      return NextResponse.json({ error: "مقاله یافت نشد" }, { status: 404 });
    }

    // Only increment view count for published posts
    await db
      .update(blogPosts)
      .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
      .where(eq(blogPosts.slug, slug));

    return NextResponse.json(posts[0]);
  } catch (err) {
    console.error("Blog post fetch error:", err);
    return NextResponse.json(
      {
        error: "خطا در دریافت مقاله",
      },
      { status: 500 },
    );
  }
}
