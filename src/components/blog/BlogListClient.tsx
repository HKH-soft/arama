"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, BookOpen, ArrowLeft, Clock, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  authorName: string | null;
  authorAvatar: string | null;
  tags: string[] | null;
  readTime: number | null;
  isFeatured: boolean;
  publishedAt: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  categoryColor: string | null;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

function formatDate(date: string | null) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogListClient({
  initialPosts,
  categories = [],
}: {
  initialPosts: BlogPost[];
  categories?: BlogCategory[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    let result = initialPosts;

    if (selectedCategory) {
      result = result.filter((p) => p.categorySlug === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q))),
      );
    }

    return result;
  }, [initialPosts, selectedCategory, searchQuery]);

  const featuredPost = filteredPosts.find((p) => p.isFeatured);
  const regularPosts = filteredPosts.filter((p) => !p.isFeatured);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-primary/2 to-transparent -z-10" />
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6"
            >
              <BookOpen className="ms-2 h-4 w-4" />
              <span>وبلاگ آراما</span>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-black text-foreground tracking-tight mb-4"
            >
              مقالات و محتوای تخصصی
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              مطالعه مقالات تخصصی سلامت روان، هوش مصنوعی و زندگی بهتر
            </motion.p>
          </motion.div>

          {/* Search */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="max-w-xl mx-auto mb-10"
          >
            <div className="relative">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="جستجوی مقالات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="جستجوی مقالات"
                className="pe-12 ps-4 h-12 rounded-2xl bg-card border-border/50 shadow-sm focus-visible:ring-primary/30"
              />
            </div>
          </motion.div>

          {/* Categories */}
          {categories.length > 0 && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap justify-center gap-2"
            >
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  !selectedCategory
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-card text-muted-foreground border border-border/50 hover:border-primary/30 hover:text-foreground"
                }`}
              >
                همه
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat.slug ? null : cat.slug,
                    )
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === cat.slug
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-card text-muted-foreground border border-border/50 hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && !searchQuery && !selectedCategory && (
        <section className="container mx-auto px-4 max-w-6xl mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href={`/blog/${featuredPost.slug}`} className="block group">
              <div className="relative rounded-3xl overflow-hidden bg-card border border-border/40 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Image */}
                  <div className="relative aspect-16/10 lg:aspect-auto lg:min-h-[25rem]">
                    {featuredPost.coverImage ? (
                      <Image
                        src={featuredPost.coverImage}
                        alt={featuredPost.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary text-primary-foreground border-0">
                        ویژه
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 lg:p-10 flex flex-col justify-center">
                    {featuredPost.categoryName && (
                      <Badge
                        variant="secondary"
                        className="w-fit mb-4 bg-primary/10 text-primary border-primary/20"
                      >
                        {featuredPost.categoryName}
                      </Badge>
                    )}
                    <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-relaxed">
                      {featuredPost.title}
                    </h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{featuredPost.authorName}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <span>{formatDate(featuredPost.publishedAt)}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {featuredPost.readTime} دقیقه
                      </span>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                      <span>خواندن مقاله</span>
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </section>
      )}

      {/* Posts Grid */}
      <section className="container mx-auto px-4 max-w-6xl pb-20">
        {regularPosts.length === 0 && !featuredPost ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              مقاله‌ای یافت نشد
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "نتیجه‌ای برای جستجوی شما یافت نشد"
                : "هنوز مقاله‌ای منتشر نشده است"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {regularPosts.map((post) => (
              <motion.div key={post.id} variants={fadeInUp}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block group h-full"
                >
                  <Card className="h-full rounded-2xl overflow-hidden border-border/30 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-500 hover:-translate-y-1 flex flex-col">
                    {/* Image */}
                    <div className="relative aspect-16/10 overflow-hidden">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-primary/30" />
                        </div>
                      )}
                      {post.categoryName && (
                        <div className="absolute top-3 right-3">
                          <Badge
                            variant="secondary"
                            className="bg-background/80 backdrop-blur-sm text-foreground border-0 text-xs"
                          >
                            {post.categoryName}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <CardContent className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                        {post.excerpt}
                      </p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/30">
                        <div className="flex items-center gap-3">
                          <span>{post.authorName}</span>
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime} دق
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
