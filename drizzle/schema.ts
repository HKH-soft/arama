import { sqliteTable, AnySQLiteColumn, index, foreignKey, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const account = sqliteTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_token_expires_at"),
	refreshTokenExpiresAt: integer("refresh_token_expires_at"),
	scope: text(),
	password: text(),
	createdAt: integer("created_at").default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`).notNull(),
	updatedAt: integer("updated_at").notNull(),
},
(table) => {
	return {
		userIdIdx: index("account_userId_idx").on(table.userId),
	}
});

export const auditLogs = sqliteTable("audit_logs", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").references(() => user.id),
	action: text().notNull(),
	entity: text(),
	entityId: text("entity_id"),
	metadata: text(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	timestamp: integer().default(sql`(strftime('%s', 'now'))`),
});

export const conversations = sqliteTable("conversations", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	title: text().notNull(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`),
});

export const emotionLogs = sqliteTable("emotion_logs", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	emotion: text().notNull(),
	score: integer().notNull(),
	loggedAt: integer("logged_at").notNull(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
});

export const exercises = sqliteTable("exercises", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	duration: text().notNull(),
	difficulty: text().notNull(),
	category: text().notNull(),
	icon: text().notNull(),
	color: text().notNull(),
	isActive: integer("is_active").default(true),
	sortOrder: integer("sort_order").default(0),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
});

export const meditationTracks = sqliteTable("meditation_tracks", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	artist: text().notNull(),
	duration: integer().notNull(),
	category: text().notNull(),
	audioUrl: text("audio_url").notNull(),
	coverImageUrl: text("cover_image_url"),
	isActive: integer("is_active").default(true),
	sortOrder: integer("sort_order").default(0),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
});

export const messages = sqliteTable("messages", {
	id: text().primaryKey().notNull(),
	conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" } ),
	content: text().notNull(),
	role: text().notNull(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`),
});

export const moodEntries = sqliteTable("mood_entries", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	mood: text().notNull(),
	loggedAt: integer("logged_at").notNull(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
});

export const payments = sqliteTable("payments", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	subscriptionId: text("subscription_id").references(() => subscriptions.id, { onDelete: "set null" } ),
	amount: real().notNull(),
	currency: text().default("IRR").notNull(),
	status: text().default("PENDING").notNull(),
	gatewayName: text("gateway_name").notNull(),
	gatewayRefId: text("gateway_ref_id"),
	description: text(),
	callbackUrl: text("callback_url"),
	paidAt: integer("paid_at"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`),
});

export const reports = sqliteTable("reports", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	title: text().notNull(),
	description: text().notNull(),
	type: text().notNull(),
	reportDate: integer("report_date").notNull(),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
});

export const session = sqliteTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: integer("expires_at").notNull(),
	token: text().notNull(),
	createdAt: integer("created_at").default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`).notNull(),
	updatedAt: integer("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
},
(table) => {
	return {
		userIdIdx: index("session_userId_idx").on(table.userId),
		tokenUnique: uniqueIndex("session_token_unique").on(table.token),
	}
});

export const subscriptionPlans = sqliteTable("subscription_plans", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	displayName: text("display_name").notNull(),
	description: text(),
	price: real().notNull(),
	durationDays: integer("duration_days").notNull(),
	features: text(),
	maxConversations: integer("max_conversations"),
	maxMessagesPerDay: integer("max_messages_per_day"),
	isActive: integer("is_active").default(true),
	sortOrder: integer("sort_order").default(0),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`),
},
(table) => {
	return {
		nameUnique: uniqueIndex("subscription_plans_name_unique").on(table.name),
	}
});

export const subscriptions = sqliteTable("subscriptions", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	planId: text("plan_id").notNull().references(() => subscriptionPlans.id),
	status: text().default("PENDING").notNull(),
	startDate: integer("start_date").notNull(),
	endDate: integer("end_date").notNull(),
	cancelledAt: integer("cancelled_at"),
	autoRenew: integer("auto_renew").default(true),
	paymentGatewayRef: text("payment_gateway_ref"),
	createdAt: integer("created_at").default(sql`(strftime('%s', 'now'))`),
	updatedAt: integer("updated_at").default(sql`(strftime('%s', 'now'))`),
});

export const user = sqliteTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: integer("email_verified").default(false).notNull(),
	image: text(),
	createdAt: integer("created_at").default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`).notNull(),
	updatedAt: integer("updated_at").default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`).notNull(),
	phone: text(),
	bio: text(),
	avatarUrl: text("avatar_url"),
	isActive: integer("is_active").default(true),
	isDeleted: integer("is_deleted").default(false),
	deletedAt: integer("deleted_at"),
	lastLoginAt: integer("last_login_at"),
	lastLoginIp: text("last_login_ip"),
	failedLoginCount: integer("failed_login_count").default(0),
	lockedUntil: integer("locked_until"),
	role: text().default("sql`("user")`").notNull(),
},
(table) => {
	return {
		emailUnique: uniqueIndex("user_email_unique").on(table.email),
	}
});

export const verification = sqliteTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: integer("expires_at").notNull(),
	createdAt: integer("created_at").default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`).notNull(),
	updatedAt: integer("updated_at").notNull(),
},
(table) => {
	return {
		identifierIdx: index("verification_identifier_idx").on(table.identifier),
	}
});

export const drizzleMigrations = sqliteTable("__drizzle_migrations", {
});

