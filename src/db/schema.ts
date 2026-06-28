import {
  sqliteTable,
  text,
  integer,
  real,
  blob,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  phone: text("phone"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  lastLoginIp: text("last_login_ip"),
  failedLoginCount: integer("failed_login_count").default(0),
  lockedUntil: integer("locked_until", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const sessions = sqliteTable("session", {
  // Changed from "sessions" to "session" for Auth.js
  id: text("id").primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const accounts = sqliteTable("account", {
  // Changed from "accounts" to "account" for Auth.js
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    // Changed from "verificationTokens" to "verificationToken" for Auth.js
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (vt) => ({
    pk: primaryKey(vt.identifier, vt.token),
  }),
);

export const emailVerificationTokens = sqliteTable(
  "email_verification_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    usedAt: integer("used_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(strftime('%s', 'now'))`,
    ),
  },
);

export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  usedAt: integer("used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const roles = sqliteTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(), // e.g., "ADMIN", "USER", "MODERATOR"
  displayName: text("display_name").notNull(), // e.g., "مدیر", "کاربر"
  description: text("description"), // Optional description
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const permissions = sqliteTable("permissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(), // e.g., "users.read", "users.write"
  displayName: text("display_name").notNull(), // e.g., "مشاهده کاربران", "ویرایش کاربران"
  description: text("description"), // Optional description
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const userRoles = sqliteTable("user_roles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  roleId: text("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  assignedAt: integer("assigned_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  assignedBy: text("assigned_by").references(() => users.id),
});

export const rolePermissions = sqliteTable("role_permissions", {
  id: text("id").primaryKey(),
  roleId: text("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  permissionId: text("permission_id")
    .notNull()
    .references(() => permissions.id, { onDelete: "cascade" }),
  assignedAt: integer("assigned_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  assignedBy: text("assigned_by").references(() => users.id),
});

export const subscriptionPlans = sqliteTable("subscription_plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(), // Internal name like "basic_monthly"
  displayName: text("display_name").notNull(), // Display name like "پلن پایه"
  description: text("description"),
  price: real("price").notNull(),
  durationDays: integer("duration_days").notNull(), // How many days the subscription lasts
  features: text("features", { mode: "json" }).$type<string[]>(), // Array of feature strings
  maxConversations: integer("max_conversations"), // Max conversations per period
  maxMessagesPerDay: integer("max_messages_per_day"), // Max messages per day
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: text("plan_id")
    .notNull()
    .references(() => subscriptionPlans.id),
  status: text("status", {
    enum: ["PENDING", "ACTIVE", "INACTIVE", "CANCELED", "EXPIRED"],
  })
    .notNull()
    .default("PENDING"),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }).notNull(),
  cancelledAt: integer("cancelled_at", { mode: "timestamp" }),
  autoRenew: integer("auto_renew", { mode: "boolean" }).default(true),
  paymentGatewayRef: text("payment_gateway_ref"), // Reference to payment transaction
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subscriptionId: text("subscription_id").references(() => subscriptions.id, {
    onDelete: "set null",
  }), // Not all payments are for subscriptions
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("IRR"), // Currency code
  status: text("status", { enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"] })
    .notNull()
    .default("PENDING"),
  gatewayName: text("gateway_name").notNull(), // Name of the payment gateway
  gatewayRefId: text("gateway_ref_id"), // Reference ID from the payment gateway
  description: text("description"),
  callbackUrl: text("callback_url"), // URL to redirect after payment
  paidAt: integer("paid_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id), // Can be null for unauthenticated actions
  action: text("action").notNull(), // Action performed (e.g., "USER_LOGIN", "DATA_EXPORT")
  entity: text("entity"), // Entity type (e.g., "user", "post", "comment")
  entityId: text("entity_id"), // ID of the entity
  metadata: text("metadata", { mode: "json" }).$type<Record<string, any>>(), // Additional data about the action
  ipAddress: text("ip_address"), // IP address of the user
  userAgent: text("user_agent"), // User agent string
  timestamp: integer("timestamp", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});
