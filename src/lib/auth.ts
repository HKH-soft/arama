import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  twoFactor,
  username,
  phoneNumber,
  magicLink,
  organization,
} from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import bcrypt from "bcryptjs";
import db from "./db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  baseURL: process.env.APP_URL || "http://localhost:8080",

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
    username(), // Future: username-based login
    phoneNumber(), // Future: SMS auth
    magicLink({
      // Future: passwordless email login
      sendMagicLink: async ({ email, url }) => {
        // TODO: Implement email sending via Resend
        console.log(`Magic link for ${email}: ${url}`);
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
});