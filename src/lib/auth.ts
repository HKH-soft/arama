import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  twoFactor,
  phoneNumber,
  magicLink,
  organization,
} from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import db from "./db";
import * as schema from "@/db/schema";
import * as relations from "@/db/relations";

const dbDriver = (process.env.DATABASE_DRIVER || "turso").toLowerCase();

export const auth = betterAuth({
  experimental: {
    joins: true,
  },
  database: drizzleAdapter(db, {
    provider: dbDriver === "neon" ? "pg" : "sqlite",
    schema: {
      ...schema,
      ...relations,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  baseURL: process.env.APP_URL || "http://localhost:3000",

  // Email/password authentication (replaces NextAuth Credentials provider)
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }) => {
        return await bcrypt.compare(password, hash);
      },
    },
  },

  // Custom fields from your existing user table
  user: {
    additionalFields: {
      phone: { type: "string", required: false },
      bio: { type: "string", required: false },
      avatarUrl: { type: "string", required: false },
      isActive: { type: "boolean", defaultValue: true, required: false },
      isDeleted: { type: "boolean", defaultValue: false, required: false },
      deletedAt: { type: "date", required: false },
      lastLoginAt: { type: "date", required: false },
      lastLoginIp: { type: "string", required: false },
      failedLoginCount: { type: "number", defaultValue: 0, required: false },
      lockedUntil: { type: "date", required: false },
    },
  },

  // Social providers (ready for future use)
  socialProviders: {
    // google: {
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // },
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // },
  },

  // All plugins - replaces custom RBAC and adds future capabilities
  plugins: [
    admin({
      // Replaces your entire custom RBAC system
      defaultRole: "user",
      adminRole: ["admin", "super_admin"],
    }),
    twoFactor(), // Future: 2FA for admin accounts
    phoneNumber(), // Future: SMS auth
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        try {
          const { sendEmail } = await import("@/lib/email");
          await sendEmail({
            to: email,
            subject: "ورود به آراما",
            html: `<div dir="rtl" style="font-family: Vazirmatn, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h2>ورود به آراما</h2><p>برای ورود به حساب کاربری خود، روی دکمه زیر کلیک کنید:</p><a href="${url}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">ورود به آراما</a><p style="color: #666; font-size: 14px;">این لینک ۱۵ دقیقه معتبر است.</p><p style="color: #666; font-size: 14px;">اگر شما درخواست ورود نکرده‌اید، این ایمیل را نادیده بگیرید.</p></div>`,
          });
        } catch (err) {
          console.error("Failed to send magic link email:", err);
        }
      },
    }),
    passkey({
      // Future: biometric/passkey auth
      rpID: process.env.NEXT_PUBLIC_APP_URL
        ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
        : "localhost",
      rpName: "Arama",
    }),
    organization(), // Future: therapist/patient organization structure
  ],

  // Rate limiting (built-in)
  rateLimit: {
    window: 60, // 60 seconds
    max: 100, // max 100 requests per window
  },

  // App name for 2FA and emails
  appName: "Arama",

  // Secret for session encryption
  secret: process.env.AUTH_SECRET,

  // Trust host (needed for production)
  trustHost: true,

  // Update lastLoginAt whenever a session is created (sign-in)
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          // Update the user's lastLoginAt on each sign-in
          if (session.userId) {
            try {
              await db
                .update(schema.users)
                .set({
                  lastLoginAt: new Date(),
                  lastLoginIp: session.ipAddress || null,
                })
                .where(eq(schema.users.id, session.userId));
            } catch (err) {
              console.error("Failed to update lastLoginAt:", err);
            }
          }
          return { data: session };
        },
      },
    },
  },
});
