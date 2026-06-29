import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import {
  permissions,
  roles,
  rolePermissions,
  subscriptionPlans,
  users,
  userRoles,
  subscriptions,
  payments,
  exercises,
  reports,
  emotionLogs,
  moodEntries,
  meditationTracks,
} from "../src/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";

// Define the possible values for NODE_ENV
type NodeEnv = 'development' | 'production' | 'test' | 'staging';

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
    envFileName = ".env.local"; // Default for development
}

// Load base .env file first (lowest priority)
dotenv.config({ path: ".env" });

// Load environment-specific file (higher priority, overrides .env)
dotenv.config({ path: envFileName });

// Use the same database path logic as db.ts
const dbPath =
  process.env.DATABASE_URL?.replace("file:", "") || "./data/arama.db";

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

// Helper to get timestamp for date calculations
const now = Math.floor(Date.now() / 1000);
const daysAgo = (days: number) => now - days * 24 * 60 * 60;
const hoursAgo = (hours: number) => now - hours * 60 * 60;

async function main() {
  console.log("Seeding database...");

  // Create permissions
  const permissionData = [
    {
      name: "users:read",
      displayName: "مشاهده کاربران",
      description: "مشاهده کاربران",
    },
    {
      name: "users:write",
      displayName: "ایجاد و ویرایش کاربران",
      description: "ایجاد و ویرایش کاربران",
    },
    {
      name: "users:delete",
      displayName: "حذف کاربران",
      description: "حذف کاربران",
    },
    {
      name: "roles:read",
      displayName: "مشاهده نقش‌ها",
      description: "مشاهده نقش‌ها",
    },
    {
      name: "roles:write",
      displayName: "ایجاد و ویرایش نقش‌ها",
      description: "ایجاد و ویرایش نقش‌ها",
    },
    {
      name: "subscriptions:read",
      displayName: "مشاهده اشتراک‌ها",
      description: "مشاهده اشتراک‌ها",
    },
    {
      name: "subscriptions:manage",
      displayName: "مدیریت اشتراک‌ها",
      description: "مدیریت اشتراک‌ها",
    },
    {
      name: "payments:read",
      displayName: "مشاهده پرداخت‌ها",
      description: "مشاهده پرداخت‌ها",
    },
    {
      name: "payments:refund",
      displayName: "استرداد پرداخت‌ها",
      description: "استرداد پرداخت‌ها",
    },
    {
      name: "audit:read",
      displayName: "مشاهده لاگ‌های حسابرسی",
      description: "مشاهده لاگ‌های حسابرسی",
    },
    {
      name: "content:manage",
      displayName: "مدیریت محتوا",
      description: "مدیریت محتوا",
    },
    {
      name: "settings:manage",
      displayName: "مدیریت تنظیمات",
      description: "مدیریت تنظیمات",
    },
  ];

  for (const perm of permissionData) {
    const existingPerm = await db
      .select()
      .from(permissions)
      .where(eq(permissions.name, perm.name));
    if (existingPerm.length === 0) {
      await db.insert(permissions).values({
        id: randomUUID(),
        name: perm.name,
        displayName: perm.displayName,
        description: perm.description,
      });
    }
  }

  console.log("Permissions created");

  // Create roles
  const rolesData = [
    {
      name: "SUPER_ADMIN",
      displayName: "مدیر ارشد",
      description: "دسترسی کامل به تمام بخش‌ها",
      permissions: [
        "users:read",
        "users:write",
        "users:delete",
        "roles:read",
        "roles:write",
        "subscriptions:read",
        "subscriptions:manage",
        "payments:read",
        "payments:refund",
        "audit:read",
        "content:manage",
        "settings:manage",
      ],
    },
    {
      name: "ADMIN",
      displayName: "مدیر",
      description: "دسترسی به بخش‌های مدیریتی",
      permissions: [
        "users:read",
        "users:write",
        "subscriptions:read",
        "subscriptions:manage",
        "payments:read",
        "audit:read",
        "content:manage",
      ],
    },
    {
      name: "USER",
      displayName: "کاربر",
      description: "کاربر عادی سیستم",
      permissions: [], // Regular users have no special permissions beyond their own account
    },
  ];

  for (const roleData of rolesData) {
    let role = await db
      .select()
      .from(roles)
      .where(eq(roles.name, roleData.name));
    if (role.length === 0) {
      const newRoleResult = await db
        .insert(roles)
        .values({
          id: randomUUID(),
          name: roleData.name,
          displayName: roleData.displayName,
          description: roleData.description,
        })
        .returning();
      role = newRoleResult;
    } else {
      // Update existing role
      await db
        .update(roles)
        .set({
          displayName: roleData.displayName,
          description: roleData.description,
        })
        .where(eq(roles.name, roleData.name));
    }

    // Clear existing permissions for this role
    await db
      .delete(rolePermissions)
      .where(eq(rolePermissions.roleId, role[0].id));

    // Assign permissions to role
    for (const permName of roleData.permissions) {
      const permission = await db
        .select()
        .from(permissions)
        .where(eq(permissions.name, permName));

      if (permission.length > 0) {
        await db.insert(rolePermissions).values({
          id: randomUUID(),
          roleId: role[0].id,
          permissionId: permission[0].id,
        });
      }
    }
  }

  console.log("Roles created");

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

  // Create demo user: سارا محمدی
  const demoUserEmail = "sara_mohammadi@gmail.com";
  const demoUserPassword = "sara_mohammadi";
  const hashedDemoPassword = await bcrypt.hash(demoUserPassword, 12);

  let demoUserId: string;

  const existingDemoUser = await db
    .select()
    .from(users)
    .where(eq(users.email, demoUserEmail));

  if (existingDemoUser.length === 0) {
    const demoUserResult = await db
      .insert(users)
      .values({
        id: randomUUID(),
        name: "سارا محمدی",
        email: demoUserEmail,
        passwordHash: hashedDemoPassword,
        phone: "09123456789",
        bio: "کاربر فعال سیستم آراما",
        isActive: true,
      })
      .returning();
    demoUserId = demoUserResult[0].id;
    console.log(`Demo user created: ${demoUserEmail}`);
  } else {
    demoUserId = existingDemoUser[0].id;
    await db
      .update(users)
      .set({
        name: "سارا محمدی",
        passwordHash: hashedDemoPassword,
        phone: "09123456789",
        bio: "کاربر فعال سیستم آراما",
      })
      .where(eq(users.id, demoUserId));
    console.log(`Demo user updated: ${demoUserEmail}`);
  }

  // Assign USER role to demo user
  const userRole = await db.select().from(roles).where(eq(roles.name, "USER"));
  if (userRole.length > 0) {
    const existingUserRole = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, demoUserId));
    if (existingUserRole.length === 0) {
      await db.insert(userRoles).values({
        id: randomUUID(),
        userId: demoUserId,
        roleId: userRole[0].id,
      });
    }
  }

  // Create demo subscription (MONTHLY)
  const monthlyPlanId = planIds["MONTHLY"];
  if (monthlyPlanId) {
    const existingSub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, demoUserId));
    if (existingSub.length === 0) {
      await db.insert(subscriptions).values({
        id: randomUUID(),
        userId: demoUserId,
        planId: monthlyPlanId,
        status: "ACTIVE",
        startDate: new Date(daysAgo(15) * 1000),
        endDate: new Date(daysAgo(-15) * 1000),
        autoRenew: true,
      });
      console.log("Demo subscription created");
    }
  }

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
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      coverImageUrl: null,
      sortOrder: 1,
    },
    {
      title: "مدیتیشن خداحافظی",
      artist: "صدای مراقب",
      duration: 900,
      category: "خواب",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      coverImageUrl: null,
      sortOrder: 2,
    },
    {
      title: "تنفس عمیق",
      artist: "راهنمای تنفسی",
      duration: 300,
      category: "تنفسی",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      coverImageUrl: null,
      sortOrder: 3,
    },
    {
      title: "ذهن‌آگاهی روزانه",
      artist: "گروه روانشناسی مثبت",
      duration: 720,
      category: "ذهن‌آگاهی",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      coverImageUrl: null,
      sortOrder: 4,
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

  // Seed reports for demo user
  const reportsData = [
    {
      userId: demoUserId,
      title: "گزارش ماهانه - خرداد ۱۴۰۴",
      description: "خلاصه عملکرد و پیشرفت روانی شما",
      type: "monthly" as const,
      reportDate: new Date(daysAgo(10) * 1000),
    },
    {
      userId: demoUserId,
      title: "گزارش ماهانه - اردیبهشت ۱۴۰۴",
      description: "خلاصه عملکرد و پیشرفت روانی شما",
      type: "monthly" as const,
      reportDate: new Date(daysAgo(40) * 1000),
    },
    {
      userId: demoUserId,
      title: "گزارش هفتگی - هفته چهارم خرداد",
      description: "تحلیل احساسات و تمرینات انجام شده",
      type: "weekly" as const,
      reportDate: new Date(daysAgo(7) * 1000),
    },
    {
      userId: demoUserId,
      title: "گزارش هفتگی - هفته سوم خرداد",
      description: "تحلیل احساسات و تمرینات انجام شده",
      type: "weekly" as const,
      reportDate: new Date(daysAgo(21) * 1000),
    },
  ];

  for (const report of reportsData) {
    const existing = await db
      .select()
      .from(reports)
      .where(eq(reports.title, report.title));
    if (existing.length === 0) {
      await db.insert(reports).values({
        id: randomUUID(),
        userId: report.userId,
        title: report.title,
        description: report.description,
        type: report.type,
        reportDate: report.reportDate,
      });
    }
  }

  console.log("Reports seeded");

  // Seed emotion logs for analytics
  const emotions = ["آرامش", "شادی", "امید", "اضطراب", "غم"];
  for (let i = 0; i < 30; i++) {
    for (const emotion of emotions) {
      const score = Math.floor(Math.random() * 60) + 40;
      await db.insert(emotionLogs).values({
        id: randomUUID(),
        userId: demoUserId,
        emotion,
        score,
        loggedAt: new Date(daysAgo(i) * 1000),
      });
    }
  }

  console.log("Emotion logs seeded");

  // Seed mood entries
  const moods = ["عالی", "آرام", "معمولی", "غمگین", "مضطرب"];
  for (let i = 0; i < 30; i++) {
    const mood = moods[Math.floor(Math.random() * moods.length)];
    await db.insert(moodEntries).values({
      id: randomUUID(),
      userId: demoUserId,
      mood,
      loggedAt: new Date(daysAgo(i) * 1000),
    });
  }

  console.log("Mood entries seeded");

  // Seed payments for demo user
  const paymentsData = [
    {
      userId: demoUserId,
      amount: 149000,
      currency: "IRR",
      status: "SUCCESS" as const,
      gatewayName: "ZARINPAL",
      description: "خرید اشتراک ماهانه",
      createdAt: new Date(daysAgo(20) * 1000),
      paidAt: new Date(daysAgo(20) * 1000),
    },
    {
      userId: demoUserId,
      amount: 1070000,
      currency: "IRR",
      status: "SUCCESS" as const,
      gatewayName: "ZARINPAL",
      description: "خرید اشتراک سالانه",
      createdAt: new Date(daysAgo(60) * 1000),
      paidAt: new Date(daysAgo(60) * 1000),
    },
    {
      userId: demoUserId,
      amount: 149000,
      currency: "IRR",
      status: "SUCCESS" as const,
      gatewayName: "ZARINPAL",
      description: "تمدید اشتراک ماهانه",
      createdAt: new Date(daysAgo(10) * 1000),
      paidAt: new Date(daysAgo(10) * 1000),
    },
  ];

  for (const payment of paymentsData) {
    const existing = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.userId, payment.userId),
          eq(payments.description, payment.description),
        ),
      );
    if (existing.length === 0) {
      await db.insert(payments).values({
        id: randomUUID(),
        ...payment,
        subscriptionId: null,
        gatewayRefId: null,
        callbackUrl: null,
      });
    }
  }

  console.log("Payments seeded");

  // Create super admin user if none exists
  const superAdminRole = await db
    .select()
    .from(roles)
    .where(eq(roles.name, "SUPER_ADMIN"));
  if (superAdminRole.length > 0) {
    const existingSuperAdmin = await db
      .select()
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(roles.name, "SUPER_ADMIN"));

    if (existingSuperAdmin.length === 0) {
      const superAdminName = process.env.SUPER_ADMIN_NAME || "مدیر ارشد سیستم";
      const superAdminEmail =
        process.env.SUPER_ADMIN_EMAIL || "superadmin@arama.app";
      const superAdminPassword =
        process.env.SUPER_ADMIN_PASSWORD || "Admin123!@#";
      const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

      const superAdminResult = await db
        .insert(users)
        .values({
          id: randomUUID(),
          name: superAdminName,
          email: superAdminEmail,
          passwordHash: hashedPassword,
          isActive: true,
        })
        .returning();

      // Assign SUPER_ADMIN role
      await db.insert(userRoles).values({
        id: randomUUID(),
        userId: superAdminResult[0].id,
        roleId: superAdminRole[0].id,
      });

      // Create FREE subscription for super admin
      const freePlan = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.name, "FREE"));

      if (freePlan.length > 0) {
        await db.insert(subscriptions).values({
          id: randomUUID(),
          userId: superAdminResult[0].id,
          planId: freePlan[0].id,
          status: "ACTIVE",
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });
      }

      console.log(
        `Super admin user created with email: ${superAdminEmail} and password: ${superAdminPassword}`,
      );
    } else {
      console.log("Super admin user already exists");
    }
  }

  console.log("\n=== Seeding Complete ===");
  console.log(`Demo User: ${demoUserEmail} / ${demoUserPassword}`);
  console.log(`Super Admin: ${process.env.SUPER_ADMIN_EMAIL || "superadmin@arama.app"} / ${process.env.SUPER_ADMIN_PASSWORD || "Admin123!@#"}`);
  console.log("Database seeded successfully!");
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