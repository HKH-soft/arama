import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as argon2 from "argon2";
import {
  permissions,
  roles,
  rolePermissions,
  subscriptionPlans,
  users,
  userRoles,
  subscriptions,
} from "../src/db/schema";
import { eq, and } from "drizzle-orm";
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
      price: 1070000, // Effectively ~89000/month with discount
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

  for (const plan of plansData) {
    const existingPlan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.name, plan.name));
    if (existingPlan.length === 0) {
      await db.insert(subscriptionPlans).values({
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
      });
    } else {
      // Update existing plan
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
  }

  console.log("Subscription plans created");

  // Create a super admin user if none exists
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
      const hashedPassword = await argon2.hash(superAdminPassword);

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
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        });
      }

      console.log(
        `Super admin user created with email: ${superAdminEmail} and password: ${superAdminPassword}`,
      );
    } else {
      console.log("Super admin user already exists");
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .then(() => {
    console.log("Seed completed successfully");
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
