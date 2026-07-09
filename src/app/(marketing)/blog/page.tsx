import { blogPosts, blogCategories } from "@/db/schema";
import { BlogListClient } from "@/components/blog/BlogListClient";
import db from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.isPublished, true))
    .orderBy(desc(blogPosts.publishedAt));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedPosts = posts.map((post: any) => ({
    ...post,
    id: String(post.id),
    publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
    createdAt: post.createdAt ? new Date(post.createdAt).toISOString() : null,
    updatedAt: post.updatedAt ? new Date(post.updatedAt).toISOString() : null,
    isFeatured: Boolean(post.isFeatured),
    categoryName: post.categoryName ?? null,
    categorySlug: post.categorySlug ?? null,
    categoryColor: post.categoryColor ?? null,
    authorName: post.authorName ?? null,
    authorAvatar: post.authorAvatar ?? null,
    coverImage: post.coverImage ?? null,
    tags: Array.isArray(post.tags) ? post.tags : [],
    readTime: post.readTime ?? 5,
  }));

  const categories = await db
    .select()
    .from(blogCategories);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedCategories = categories.map((cat: any) => ({
    id: String(cat.id),
    name: String(cat.name),
    slug: String(cat.slug),
    color: cat.color ?? null,
  }));

  return (
    <BlogListClient
      initialPosts={serializedPosts}
      categories={serializedCategories}
    />
  );
}
