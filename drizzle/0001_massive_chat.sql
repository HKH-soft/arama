CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer,
	`image` text,
	`password_hash` text,
	`phone` text,
	`bio` text,
	`avatar_url` text,
	`is_active` integer DEFAULT true,
	`is_deleted` integer DEFAULT false,
	`deleted_at` integer,
	`last_login_at` integer,
	`last_login_ip` text,
	`failed_login_count` integer DEFAULT 0,
	`locked_until` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_account` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_account`("id", "user_id", "type", "provider", "provider_account_id", "refresh_token", "access_token", "expires_at", "token_type", "scope", "id_token", "session_state") SELECT "id", "user_id", "type", "provider", "provider_account_id", "refresh_token", "access_token", "expires_at", "token_type", "scope", "id_token", "session_state" FROM `account`;--> statement-breakpoint
DROP TABLE `account`;--> statement-breakpoint
ALTER TABLE `__new_account` RENAME TO `account`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`entity` text,
	`entity_id` text,
	`metadata` text,
	`ip_address` text,
	`user_agent` text,
	`timestamp` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_audit_logs`("id", "user_id", "action", "entity", "entity_id", "metadata", "ip_address", "user_agent", "timestamp") SELECT "id", "user_id", "action", "entity", "entity_id", "metadata", "ip_address", "user_agent", "timestamp" FROM `audit_logs`;--> statement-breakpoint
DROP TABLE `audit_logs`;--> statement-breakpoint
ALTER TABLE `__new_audit_logs` RENAME TO `audit_logs`;--> statement-breakpoint
CREATE TABLE `__new_conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_conversations`("id", "user_id", "title", "created_at", "updated_at") SELECT "id", "user_id", "title", "created_at", "updated_at" FROM `conversations`;--> statement-breakpoint
DROP TABLE `conversations`;--> statement-breakpoint
ALTER TABLE `__new_conversations` RENAME TO `conversations`;--> statement-breakpoint
CREATE TABLE `__new_email_verification_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_email_verification_tokens`("id", "user_id", "token", "expires_at", "used_at", "created_at") SELECT "id", "user_id", "token", "expires_at", "used_at", "created_at" FROM `email_verification_tokens`;--> statement-breakpoint
DROP TABLE `email_verification_tokens`;--> statement-breakpoint
ALTER TABLE `__new_email_verification_tokens` RENAME TO `email_verification_tokens`;--> statement-breakpoint
CREATE UNIQUE INDEX `email_verification_tokens_token_unique` ON `email_verification_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `__new_password_reset_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_password_reset_tokens`("id", "user_id", "token", "expires_at", "used_at", "created_at") SELECT "id", "user_id", "token", "expires_at", "used_at", "created_at" FROM `password_reset_tokens`;--> statement-breakpoint
DROP TABLE `password_reset_tokens`;--> statement-breakpoint
ALTER TABLE `__new_password_reset_tokens` RENAME TO `password_reset_tokens`;--> statement-breakpoint
CREATE UNIQUE INDEX `password_reset_tokens_token_unique` ON `password_reset_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `__new_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subscription_id` text,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'IRR' NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`gateway_name` text NOT NULL,
	`gateway_ref_id` text,
	`description` text,
	`callback_url` text,
	`paid_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_payments`("id", "user_id", "subscription_id", "amount", "currency", "status", "gateway_name", "gateway_ref_id", "description", "callback_url", "paid_at", "created_at", "updated_at") SELECT "id", "user_id", "subscription_id", "amount", "currency", "status", "gateway_name", "gateway_ref_id", "description", "callback_url", "paid_at", "created_at", "updated_at" FROM `payments`;--> statement-breakpoint
DROP TABLE `payments`;--> statement-breakpoint
ALTER TABLE `__new_payments` RENAME TO `payments`;--> statement-breakpoint
CREATE TABLE `__new_role_permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	`assigned_at` integer DEFAULT (strftime('%s', 'now')),
	`assigned_by` text,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assigned_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_role_permissions`("id", "role_id", "permission_id", "assigned_at", "assigned_by") SELECT "id", "role_id", "permission_id", "assigned_at", "assigned_by" FROM `role_permissions`;--> statement-breakpoint
DROP TABLE `role_permissions`;--> statement-breakpoint
ALTER TABLE `__new_role_permissions` RENAME TO `role_permissions`;--> statement-breakpoint
CREATE TABLE `__new_session` (
	`id` text PRIMARY KEY NOT NULL,
	`session_token` text NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_session`("id", "session_token", "user_id", "expires") SELECT "id", "session_token", "user_id", "expires" FROM `session`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
ALTER TABLE `__new_session` RENAME TO `session`;--> statement-breakpoint
CREATE UNIQUE INDEX `session_session_token_unique` ON `session` (`session_token`);--> statement-breakpoint
CREATE TABLE `__new_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`cancelled_at` integer,
	`auto_renew` integer DEFAULT true,
	`payment_gateway_ref` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_subscriptions`("id", "user_id", "plan_id", "status", "start_date", "end_date", "cancelled_at", "auto_renew", "payment_gateway_ref", "created_at", "updated_at") SELECT "id", "user_id", "plan_id", "status", "start_date", "end_date", "cancelled_at", "auto_renew", "payment_gateway_ref", "created_at", "updated_at" FROM `subscriptions`;--> statement-breakpoint
DROP TABLE `subscriptions`;--> statement-breakpoint
ALTER TABLE `__new_subscriptions` RENAME TO `subscriptions`;--> statement-breakpoint
CREATE TABLE `__new_user_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	`assigned_at` integer DEFAULT (strftime('%s', 'now')),
	`assigned_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assigned_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user_roles`("id", "user_id", "role_id", "assigned_at", "assigned_by") SELECT "id", "user_id", "role_id", "assigned_at", "assigned_by" FROM `user_roles`;--> statement-breakpoint
DROP TABLE `user_roles`;--> statement-breakpoint
ALTER TABLE `__new_user_roles` RENAME TO `user_roles`;