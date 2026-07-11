/**
 * Seed script for all 14 Arama blog posts
 *
 * Usage:
 *   npx tsx drizzle/seed-blog-series.ts
 *
 * This will:
 * 1. Create/update categories if needed
 * 2. Insert all 14 posts (skips duplicates by slug)
 *
 * Posts are in blog-post-01.ts through blog-post-14.ts
 */
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { blogCategories, blogPosts } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";

// ── Posts ──────────────────────────────────────────
import { post01 } from "./blog-post-01";
import { post02 } from "./blog-post-02";
import { post03 } from "./blog-post-03";
import { post04 } from "./blog-post-04";
import { post05 } from "./blog-post-05";
import { post06 } from "./blog-post-06";
import { post07 } from "./blog-post-07";
import { post08 } from "./blog-post-08";
import { post09 } from "./blog-post-09";
import { post10 } from "./blog-post-10";
import { post11 } from "./blog-post-11";
import { post12 } from "./blog-post-12";
import { post13 } from "./blog-post-13";
import { post14 } from "./blog-post-14";

// ── Env ────────────────────────────────────────────
type NodeEnv = "development" | "production" | "test" | "staging";
const nodeEnv: NodeEnv = (process.env.NODE_ENV as NodeEnv) || "development";
let envFileName = ".env";

switch (nodeEnv) {
  case "production":
    envFileName = ".env.production";
    break;
  case "staging":
    envFileName = ".env.staging";
    break;
  case "test":
    envFileName = ".env.test";
    break;
  default:
    envFileName = ".env.local";
}

dotenv.config({ path: ".env" });
dotenv.config({ path: envFileName });

// ── Driver ─────────────────────────────────────────
const driver = (process.env.DATABASE_DRIVER || "turso").toLowerCase();
let db: ReturnType<typeof drizzleLibsql>;

if (driver === "neon") {
  const sql = neon(process.env.DATABASE_URL!);
  db = drizzleNeonHttp(sql);
} else {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  db = drizzleLibsql(client);
}

// ── Categories ─────────────────────────────────────
const categories = [
  {
    name: "سلامت روان",
    slug: "mental-health",
    color: "#10b77f",
    description: "مقاله‌های تخصصی درباره سلامت روان و بهزیستی",
  },
  {
    name: "هوش مصنوعی",
    slug: "ai",
    color: "#6366f1",
    description: "آخرین اخبار و مقالات هوش مصنوعی در سلامت روان",
  },
  {
    name: "زندگی سالم",
    slug: "healthy-living",
    color: "#f59e0b",
    description: "نکات و راهکارهای زندگی سالم و تأثیر آن بر روان",
  },
  {
    name: "مدیتیشن",
    slug: "meditation",
    color: "#8b5cf6",
    description: "آموزش و راهنمای مدیتیشن و آرامش ذهن",
  },
];

// ── All Posts ──────────────────────────────────────
const posts = [
  post01,
  post02,
  post03,
  post04,
  post05,
  post06,
  post07,
  post08,
  post09,
  post10,
  post11,
  post12,
  post13,
  post14,
];

// ── Main ───────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding Arama blog series (14 posts)...");

  // 1. Seed categories
  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const existing = await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.slug, cat.slug));

    if (existing.length === 0) {
      const id = randomUUID();
      await db.insert(blogCategories).values({
        id,
        name: cat.name,
        slug: cat.slug,
        color: cat.color,
        description: cat.description,
        sortOrder: categories.indexOf(cat),
      });
      categoryMap[cat.slug] = id;
      console.log(`  ✅ Category: ${cat.name}`);
    } else {
      categoryMap[cat.slug] = existing[0].id;
      console.log(`  ⏭️  Category exists: ${cat.name}`);
    }
  }

  // 2. Seed posts
  let inserted = 0;
  let skipped = 0;

  for (const post of posts) {
    const existing = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, post.slug));

    if (existing.length === 0) {
      const now = new Date();
      await db.insert(blogPosts).values({
        id: randomUUID(),
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        authorName: post.authorName,
        categoryId: categoryMap[post.categorySlug] || null,
        tags: post.tags,
        readTime: post.readTime,
        isPublished: true,
        isFeatured: post.isFeatured ?? false,
        viewCount: 0,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
      });
      inserted++;
      console.log(`  ✅ [${inserted + skipped}/14] ${post.title}`);
    } else {
      skipped++;
      console.log(`  ⏭️  [${inserted + skipped}/14] Exists: ${post.slug}`);
    }
  }

  console.log(`\n🎉 Done! Inserted: ${inserted}, Skipped: ${skipped}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
