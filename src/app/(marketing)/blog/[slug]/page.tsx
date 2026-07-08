"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Eye, BookOpen, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  authorName: string | null;
  authorAvatar: string | null;
  tags: string[] | null;
  readTime: number | null;
  viewCount: number | null;
  publishedAt: string | null;
  createdAt: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  categoryColor: string | null;
}

function formatDate(date: string | null) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function RelatedPostSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border/30">
      <div className="aspect-video bg-muted animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded w-4/5 animate-pulse" />
        <div className="h-3 bg-muted rounded w-3/5 animate-pulse" />
      </div>
    </div>
  );
}

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/blog/${slug}`);
        if (!res.ok) {
          setError("مقاله یافت نشد");
          return;
        }
        const data = await res.json();
        setPost(data);

        // Fetch related posts
        if (data.categorySlug) {
          const relatedRes = await fetch(
            `/api/blog?category=${data.categorySlug}&limit=3`,
          );
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            setRelatedPosts(
              relatedData.posts
                .filter((p: BlogPost) => p.slug !== slug)
                .slice(0, 3),
            );
          }
        }
      } catch {
        setError("خطا در بارگذاری مقاله");
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl py-12">
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-muted rounded w-1/4" />
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="aspect-2/1 bg-muted rounded-2xl mt-8" />
            <div className="space-y-3 mt-8">
              {[87, 93, 81, 95, 88, 90, 84, 92].map((w, i) => (
                <div
                  key={i}
                  className="h-4 bg-muted rounded"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {error || "مقاله یافت نشد"}
          </h2>
          <p className="text-muted-foreground mb-6">
            مقاله مورد نظر وجود ندارد یا حذف شده است
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به وبلاگ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Back nav */}
      <div className="container mx-auto px-4 max-w-4xl pt-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          بازگشت به وبلاگ
        </Link>
      </div>

      {/* Article Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 max-w-4xl pt-8 pb-6"
      >
        {post.categoryName && (
          <Badge
            variant="secondary"
            className="mb-4 bg-primary/10 text-primary border-primary/20"
          >
            {post.categoryName}
          </Badge>
        )}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.3] mb-6">
          {post.title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          {post.excerpt}
        </p>

        {/* Author & Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5">
            {post.authorAvatar ? (
              <Image
                src={post.authorAvatar}
                alt={post.authorName || ""}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                {(post.authorName || "آ").charAt(0)}
              </div>
            )}
            <span className="font-medium text-foreground">
              {post.authorName}
            </span>
          </div>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <span>{formatDate(post.publishedAt)}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime} دقیقه مطالعه
          </span>
          {post.viewCount != null && post.viewCount > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.viewCount.toLocaleString("fa-IR")} بازدید
              </span>
            </>
          )}
        </div>
      </motion.header>

      {/* Cover Image */}
      {post.coverImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="container mx-auto px-4 max-w-5xl mb-10"
        >
          <div className="relative aspect-2/1 rounded-3xl overflow-hidden shadow-lg">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>
      )}

      {/* Article Content */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="container mx-auto px-4 max-w-4xl pb-12"
      >
        <div
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:text-foreground
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-muted-foreground prose-p:leading-loose
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
            prose-blockquote:border-primary/30 prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-xl prose-blockquote:py-1
            prose-img:rounded-2xl
            prose-li:text-muted-foreground
            [&>pre]:bg-muted [&>pre]:border [&>pre]:border-border/50 [&>pre]:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </motion.article>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="container mx-auto px-4 max-w-4xl pb-8">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-muted/60 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-4xl">
        <Separator className="my-8" />
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="container mx-auto px-4 max-w-6xl pb-20">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            مقالات مرتبط
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((rp) => (
              <Link
                key={rp.id}
                href={`/blog/${rp.slug}`}
                className="block group"
              >
                <article className="rounded-2xl overflow-hidden bg-card border border-border/30 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-500 hover:-translate-y-1">
                  <div className="relative aspect-video overflow-hidden">
                    {rp.coverImage ? (
                      <Image
                        src={rp.coverImage}
                        alt={rp.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-primary/10 to-transparent flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-primary/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {rp.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {rp.excerpt}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back to blog CTA */}
      <div className="container mx-auto px-4 max-w-4xl pb-16 text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-card border border-border/50 text-foreground font-medium hover:border-primary/30 hover:shadow-md transition-all duration-200"
        >
          <ArrowRight className="w-4 h-4" />
          مشاهده همه مقالات
        </Link>
      </div>
    </div>
  );
}
