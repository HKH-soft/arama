# Database Documentation - Arama Project

## Overview

This document provides an accurate, up-to-date overview of the database structure, configuration, and related files in the Arama project.

---

## Database Engine & Libraries &nbsp; **Database Engine**

- **SQLite** - The underlying database engine
- **better-sqlite3** (^12.11.1) - SQLite3 driver for Node.js
- **Drizzle ORM** (^0.45.2) - Type-safe SQL toolkit for TypeScript
- **drizzle-kit** (^0.28.1) - Migration and schema management tool

---

## Database Files and Directories

### Main Database Directory

```
src/db/schema.ts - Contains all database table schemas defined with Drizzle ORM
```

### Drizzle Migration Directory

```
drizzle/ - Contains all migration-related files
drizzle/0000_careful_cardiac.sql - SQL migration file (initial schema)
drizzle/meta/ - Migration metadata directory
drizzle/meta/0000_snapshot.json - Database schema snapshot
drizzle/meta/_journal.json - Migration journal
drizzle/seed.ts - Database seeding script
drizzle.config.ts - Drizzle configuration file
```

### Migration Script

```
migrate-to-drizzle.ts - Migration preparation script (installs drizzle-kit, generates schema)
```

---

## Database Configuration

### drizzle.config.ts

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "./db.sqlite",
  },
});
```

### next.config.ts (Server External Packages)

```typescript
serverExternalPackages: [
  "argon2",
  "pino",
  "pino-pretty",
  "better-sqlite3",
  "@opennextjs/cloudflare",
  "drizzle-orm/d1",
];
```

### Environment Variables

| Variable               | Description                      | Default                |
| ---------------------- | -------------------------------- | ---------------------- |
| `DATABASE_URL`         | Database connection string       | `./db.sqlite`          |
| `SUPER_ADMIN_EMAIL`    | Super admin email for seeding    | `superadmin@arama.app` |
| `SUPER_ADMIN_PASSWORD` | Super admin password for seeding | `Admin123!@#`          |
| `SUPER_ADMIN_NAME`     | Super admin name for seeding     | `مدیر ارشد سیستم`      |

---

## Database Schema Tables

### Authentication Tables (Auth.js v5 Compatible)

> **Note:** Table names use singular form for Auth.js v5 compatibility

| Table                       | Description               | Key Columns                                                                                                                                                                                                                            |
| --------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`                     | User accounts             | `id`, `name`, `email` (unique), `emailVerified`, `image`, `passwordHash`, `phone`, `bio`, `avatarUrl`, `isActive`, `isDeleted`, `deletedAt`, `lastLoginAt`, `lastLoginIp`, `failedLoginCount`, `lockedUntil`, `createdAt`, `updatedAt` |
| `session`                   | Session management        | `id`, `sessionToken` (unique), `userId` (FK), `expires`                                                                                                                                                                                |
| `account`                   | OAuth accounts            | `id`, `userId` (FK), `type`, `provider`, `providerAccountId`, `refresh_token`, `access_token`, `expires_at`, `token_type`, `scope`, `id_token`, `session_state`                                                                        |
| `verificationToken`         | Token verification        | `identifier`, `token` (unique), `expires` (composite PK)                                                                                                                                                                               |
| `email_verification_tokens` | Email verification tokens | `id`, `userId` (FK), `token` (unique), `expiresAt`, `usedAt`, `createdAt`                                                                                                                                                              |
| `password_reset_tokens`     | Password reset tokens     | `id`, `userId` (FK), `token` (unique), `expiresAt`, `usedAt`, `createdAt`                                                                                                                                                              |

### RBAC (Role-Based Access Control) Tables

| Table              | Description                   | Key Columns                                                                               |
| ------------------ | ----------------------------- | ----------------------------------------------------------------------------------------- |
| `roles`            | User roles                    | `id`, `name` (unique), `displayName`, `description`, `isActive`, `createdAt`, `updatedAt` |
| `permissions`      | System permissions            | `id`, `name` (unique), `displayName`, `description`, `isActive`, `createdAt`, `updatedAt` |
| `user_roles`       | Junction: users ↔ roles       | `id`, `userId` (FK), `roleId` (FK), `assignedAt`, `assignedBy` (FK)                       |
| `role_permissions` | Junction: roles ↔ permissions | `id`, `roleId` (FK), `permissionId` (FK), `assignedAt`, `assignedBy` (FK)                 |

### Subscription & Payment Tables

| Table                | Description                  | Key Columns                                                                                                                                                                                                                            |
| -------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `subscription_plans` | Available subscription plans | `id`, `name` (unique), `displayName`, `description`, `price`, `durationDays`, `features` (JSON), `maxConversations`, `maxMessagesPerDay`, `isActive`, `sortOrder`, `createdAt`, `updatedAt`                                            |
| `subscriptions`      | User subscriptions           | `id`, `userId` (FK), `planId` (FK), `status` (PENDING/ACTIVE/INACTIVE/CANCELED/EXPIRED), `startDate`, `endDate`, `cancelledAt`, `autoRenew`, `paymentGatewayRef`, `createdAt`, `updatedAt`                                             |
| `payments`           | Payment records              | `id`, `userId` (FK), `subscriptionId` (FK, nullable), `amount`, `currency` (default: IRR), `status` (PENDING/SUCCESS/FAILED/REFUNDED), `gatewayName`, `gatewayRefId`, `description`, `callbackUrl`, `paidAt`, `createdAt`, `updatedAt` |

### Audit & Logs Tables

| Table        | Description   | Key Columns                                                                                                             |
| ------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `audit_logs` | Audit logging | `id`, `userId` (FK, nullable), `action`, `entity`, `entityId`, `metadata` (JSON), `ipAddress`, `userAgent`, `timestamp` |

> **Note:** The `notifications` table mentioned in some documentation does **not exist** in the current schema.

### Wellness Application Tables

| Table           | Description                   | Key Columns                                                                               |
| --------------- | ----------------------------- | ----------------------------------------------------------------------------------------- |
| `conversations` | Chat conversations            | `id`, `userId` (FK), `title`, `createdAt`, `updatedAt`                                    |
| `messages`      | Messages within conversations | `id`, `conversationId` (FK), `content`, `role` (user/assistant), `createdAt`, `updatedAt` |

---

## Key Relationships

```
users (1) ──────< (N) session
users (1) ──────< (N) account
users (1) ──────< (N) email_verification_tokens
users (1) ──────< (N) password_reset_tokens
users (N) ──────> (N) roles (via user_roles)
roles (N) ──────> (N) permissions (via role_permissions)
users (1) ──────< (N) subscriptions
subscription_plans (1) ──────< (N) subscriptions
users (1) ──────< (N) payments
subscriptions (1) ──────< (N) payments
users (1) ──────< (N) conversations
conversations (1) ──────< (N) messages
users (1) ──────< (N) audit_logs
```

---

## Database Commands

```bash
# Generate migrations
npm run db:generate

# Push schema changes to database
npm run db:push

# Run migrations
npm run db:migrate

# Open Drizzle Studio
npm run db:studio

# Seed database
npm run db:seed
```

---

## Related Files

### Authentication & Authorization

- `src/lib/auth.ts` - NextAuth.js configuration
- `src/lib/auth-helpers.ts` - Authentication helpers
- `src/lib/auth-helpers-no-auth.ts` - Helpers without auth
- `src/lib/auth.config.ts` - Auth configuration
- `src/lib/rbac.ts` - Role-based access control utilities
- `src/lib/permissions.ts` - Permission utilities

### Database & Services

- `src/lib/db.ts` - Database connection
- `src/lib/prisma.ts` - Prisma client (legacy)
- `src/lib/audit.ts` - Audit logging
- `src/lib/services/` - Service layer
- `src/lib/validators/` - Validation schemas

### API Routes (Database Interactions)

- `src/app/api/auth/` - Authentication endpoints
- `src/app/api/chat/` - Chat endpoints
- `src/app/api/subscriptions/` - Subscription endpoints
- `src/app/api/payments/` - Payment endpoints
- `src/app/api/profile/` - Profile endpoints
- `src/app/api/admin/` - Admin endpoints
- `src/app/api/notifications/` - Notification endpoints

### Hooks

- `src/hooks/useChat.ts` - Chat hook
- `src/hooks/useAudioPlayer.ts` - Audio player hook
- `src/hooks/use-toast.ts` - Toast notifications
- `src/hooks/use-mobile.tsx` - Mobile detection

---

## Seeding Data

The seed script (`drizzle/seed.ts`) creates:

1. **Permissions** - 12 system permissions
2. **Roles** - SUPER_ADMIN, ADMIN, USER with permission assignments
3. **Subscription Plans** - FREE, MONTHLY, YEARLY, PROFESSIONAL
4. **Super Admin User** - Created if none exists (configurable via env vars)

---

## Version Information

- **Next.js**: ^16.2.9
- **React**: ^19.2.7
- **NextAuth.js**: ^5.0.0-beta.25
- **Drizzle ORM**: ^0.45.2
- **better-sqlite3**: ^12.11.1
- **Node.js**: >=20 (recommended)

---

## Common Issues & Fixes

### 1. "Cannot open database because the directory does not exist"

**Cause:** The database file path directory doesn't exist.
**Fix:** Ensure the directory exists before opening the database. See `src/lib/db.ts` for the fix.

### 2. "credentialSignIn" error with correct credentials

**Cause:** NextAuth.js v5 callback naming or credential validation issue.
**Fix:** Check `src/lib/auth.ts` for proper callback configuration and credential verification.

---

_Last Updated: 2026-06-28_
_Generated from actual codebase analysis_
