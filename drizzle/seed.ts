import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  users,
  accounts,
  subscriptionPlans,
  subscriptions,
  payments,
  exercises,
  reports,
  emotionLogs,
  moodEntries,
  meditationTracks,
} from "../src/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";

// Define the possible values for NODE_ENV
type NodeEnv = "development" | "production" | "test" | "staging";

// Determine environment and load appropriate .env file
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

// ── Driver selection ──────────────────────────────────────────
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

// Helper to get timestamp for date calculations
const now = Math.floor(Date.now() / 1000);
const daysAgo = (days: number) => now - days * 24 * 60 * 60;

async function main() {
  console.log("Seeding database...");

  // ============================================================
  // Seed Users (with proper Better Auth password hashing)
  // ============================================================
  const usersData = [
    {
      email: process.env.ADMIN_EMAIL || "admin@arama.life",
      password: process.env.ADMIN_PASSWORD || "Admin@123456",
      name: "مدیر سیستم",
    },
    {
      email: "user@arama.ir",
      password: "User@123456",
      name: "کاربر تست",
    },
  ];

  for (const userData of usersData) {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email));

    if (existingUser.length === 0) {
      const userId = randomUUID();
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // FIXED: Initialized as Date objects to fix the value.getTime() mapping error
      const currentTimestamp = new Date();

      // Insert user with role
      await db.insert(users).values({
        id: userId,
        email: userData.email,
        name: userData.name,
        emailVerified: true,
        isActive: true,
        isDeleted: false,
        role:
          userData.email === (process.env.ADMIN_EMAIL || "admin@arama.life")
            ? "super_admin"
            : "user",
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
      });

      // Insert account with hashed password
      await db.insert(accounts).values({
        id: randomUUID(),
        userId: userId,
        accountId: userData.email,
        providerId: "credential", // FIXED: Changed from "email" to support Better Auth defaults
        password: hashedPassword,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
      });

      console.log(`✓ User created: ${userData.email}`);
    } else {
      console.log(`- User already exists: ${userData.email}`);
      // Update role for existing admin user if needed
      if (userData.email === (process.env.ADMIN_EMAIL || "admin@arama.life")) {
        await db
          .update(users)
          .set({ role: "super_admin" })
          .where(
            eq(users.email, process.env.ADMIN_EMAIL || "admin@arama.life"),
          );
        console.log(`✓ Admin user role updated to super_admin`);
      } else if (userData.email === "user@arama.ir") {
        await db
          .update(users)
          .set({ role: "user" })
          .where(eq(users.email, "user@arama.ir"));
        console.log(`✓ Regular user role updated to user`);
      }
    }
  }

  // Create subscription plans
  const plansData = [
    {
      name: "FREE",
      displayName: "رایگان",
      description: "دسترسی پایه به امکانات آراما",
      price: 0,
      durationDays: 0,
      features: ["۵ گفتگو در روز", "تمرینات پایه", "مدیتیشن‌های عمومی"],
      maxConversations: 5,
      maxMessagesPerDay: 50,
      isActive: true,
      sortOrder: 0,
    },
    {
      name: "MONTHLY",
      displayName: "ماهانه",
      description: "اشتراک یک ماهه آراما",
      price: 149000,
      durationDays: 30,
      features: [
        "گفتگوهای نامحدود",
        "تمام تمرینات",
        "تمام مدیتیشن‌ها",
        "گزارش‌های تحلیلی",
        "پشتیبانی اولویت‌دار",
      ],
      maxConversations: null,
      maxMessagesPerDay: null,
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "YEARLY",
      displayName: "سالانه",
      description: "اشتراک یک ساله آراما — ۴۰٪ تخفیف",
      price: 1070000,
      durationDays: 365,
      features: [
        "تمام امکانات ماهانه",
        "۴۰٪ تخفیف",
        "دسترسی زودهنگام به ویژگی‌های جدید",
        "مشاوره رایگان ماهانه",
      ],
      maxConversations: null,
      maxMessagesPerDay: null,
      isActive: true,
      sortOrder: 2,
    },
    {
      name: "PROFESSIONAL",
      displayName: "حرفه‌ای",
      description: "برای روانشناسان و مشاوران",
      price: 499000,
      durationDays: 30,
      features: [
        "تمام امکانات سالانه",
        "پنل مدیریت بیماران",
        "API اختصاصی",
        "گزارش‌های تخصصی",
        "پشتیبانی ۲۴/۷",
        "برندینگ سفارشی",
      ],
      maxConversations: null,
      maxMessagesPerDay: null,
      isActive: true,
      sortOrder: 3,
    },
  ];

  const planIds: Record<string, string> = {};

  for (const plan of plansData) {
    const existingPlan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.name, plan.name));
    let planId: string;
    if (existingPlan.length === 0) {
      const result = await db
        .insert(subscriptionPlans)
        .values({
          id: randomUUID(),
          name: plan.name,
          displayName: plan.displayName,
          description: plan.description,
          price: plan.price,
          durationDays: plan.durationDays,
          features: plan.features,
          maxConversations: plan.maxConversations,
          maxMessagesPerDay: plan.maxMessagesPerDay,
          isActive: plan.isActive,
          sortOrder: plan.sortOrder,
        })
        .returning();
      planId = result[0].id;
    } else {
      planId = existingPlan[0].id;
      await db
        .update(subscriptionPlans)
        .set({
          displayName: plan.displayName,
          description: plan.description,
          price: plan.price,
          durationDays: plan.durationDays,
          features: plan.features,
          maxConversations: plan.maxConversations,
          maxMessagesPerDay: plan.maxMessagesPerDay,
          isActive: plan.isActive,
          sortOrder: plan.sortOrder,
        })
        .where(eq(subscriptionPlans.name, plan.name));
    }
    planIds[plan.name] = planId;
  }

  console.log("Subscription plans created");

  // Seed exercises
  const exercisesData = [
    {
      title: "تنفس ۴-۷-۸",
      description: "تکنیک آرام‌سازی سریع با تنفس عمیق",
      duration: "۵ دقیقه",
      difficulty: "آسان",
      category: "تنفسی",
      icon: "Wind",
      color: "from-blue-500/20 to-cyan-500/10",
      sortOrder: 1,
    },
    {
      title: "مدیتیشن بدن‌آگاهی",
      description: "اسکن بدن از سر تا پا برای رهایی از تنش",
      duration: "۱۵ دقیقه",
      difficulty: "متوسط",
      category: "مدیتیشن",
      icon: "Activity",
      color: "from-purple-500/20 to-pink-500/10",
      sortOrder: 2,
    },
    {
      title: "تنفس جعبه‌ای",
      description: "تنفس ۴ مرحله‌ای برای تمرکز و آرامش",
      duration: "۱۰ دقیقه",
      difficulty: "آسان",
      category: "تنفسی",
      icon: "Wind",
      color: "from-green-500/20 to-emerald-500/10",
      sortOrder: 3,
    },
    {
      title: "یوگای صبحگاهی",
      description: "حرکات کششی ساده برای شروع روز پرانرژی",
      duration: "۲۰ دقیقه",
      difficulty: "متوسط",
      category: "حرکتی",
      icon: "Activity",
      color: "from-orange-500/20 to-yellow-500/10",
      sortOrder: 4,
    },
    {
      title: "آرامش عضلانی",
      description: "انقباض و رهاسازی عضلات برای کاهش تنش فیزیکی",
      duration: "۱۲ دقیقه",
      difficulty: "آسان",
      category: "مدیتیشن",
      icon: "Wind",
      color: "from-indigo-500/20 to-violet-500/10",
      sortOrder: 5,
    },
    {
      title: "ذهن‌آگاهی در حرکت",
      description: "پیاده‌روی آگاهانه با تمرکز بر لحظه حال",
      duration: "۲۵ دقیقه",
      difficulty: "پیشرفته",
      category: "ذهن‌آگاهی",
      icon: "Activity",
      color: "from-rose-500/20 to-red-500/10",
      sortOrder: 6,
    },
  ];

  for (const ex of exercisesData) {
    const existing = await db
      .select()
      .from(exercises)
      .where(eq(exercises.title, ex.title));
    if (existing.length === 0) {
      await db.insert(exercises).values({
        id: randomUUID(),
        ...ex,
        isActive: true,
      });
    }
  }

  console.log("Exercises seeded");

  // Seed meditation tracks
  const tracksData = [
    {
      title: "آرامش صبحگاهی",
      artist: "موسیقی آرام‌بخش",
      duration: 600,
      category: "آرامش",
      audioUrl: "/audio/calm-warm-drone.mp3",
      coverImageUrl: null,
      sortOrder: 1,
    },
    {
      title: "مدیتیشن خداحافظی",
      artist: "صدای مراقب",
      duration: 900,
      category: "خواب",
      audioUrl: "/audio/calm-ambient-space.mp3",
      coverImageUrl: null,
      sortOrder: 2,
    },
    {
      title: "تنفس عمیق",
      artist: "راهنمای تنفسی",
      duration: 300,
      category: "تنفسی",
      audioUrl: "/audio/calm-wandering.mp3",
      coverImageUrl: null,
      sortOrder: 3,
    },
    {
      title: "ذهن‌آگاهی روزانه",
      artist: "گروه روانشناسی مثبت",
      duration: 720,
      category: "ذهن‌آگاهی",
      audioUrl: "/audio/calm-forest-meditation.mp3",
      coverImageUrl: null,
      sortOrder: 4,
    },
    {
      title: "شکرگزاری صبح",
      artist: "موسیقی مثبت‌اندیشی",
      duration: 480,
      category: "مثبت‌اندیشی",
      audioUrl: "/audio/calm-peaceful-water.mp3",
      coverImageUrl: null,
      sortOrder: 5,
    },
    {
      title: "شفقت با خود",
      artist: "موسیقی کم‌نوا",
      duration: 720,
      category: "شفقت",
      audioUrl: "/audio/calm-decline.mp3",
      coverImageUrl: null,
      sortOrder: 6,
    },
  ];

  for (const track of tracksData) {
    const existing = await db
      .select()
      .from(meditationTracks)
      .where(eq(meditationTracks.title, track.title));
    if (existing.length === 0) {
      await db.insert(meditationTracks).values({
        id: randomUUID(),
        ...track,
        isActive: true,
      });
    }
  }

  console.log("Meditation tracks seeded");

  console.log("\n=== Seeding Complete ===");
  console.log("Database seeded successfully!");
  console.log("\nDefault users created:");
  console.log(
    `  Admin: ${process.env.ADMIN_EMAIL || "admin@arama.life"} / ${process.env.ADMIN_PASSWORD || "Admin@123456"}`,
  );
  console.log("  User:  user@arama.ir / User@123456");
  console.log("\nYou can now login at /login");
}

main()
  .then(() => {
    console.log("Seed completed successfully");
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
