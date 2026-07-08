# آراما — هوش مصنوعی سلامت روان

> هم‌صحبت امن روزهای سخت. دستیار هوشمند سلامت روان که همیشه در کنار توست.

## Overview

آراما is an AI-powered mental health companion application built with Next.js 15 (App Router), TypeScript, and Drizzle ORM. It provides conversational AI therapy, mood tracking, meditation, exercises, subscription management, and a full admin panel — with a Persian (Farsi) RTL-first interface.

## Tech Stack

| Layer            | Technology                            |
| ---------------- | ------------------------------------- |
| Framework        | Next.js 15 (App Router)               |
| Language         | TypeScript                            |
| Database         | SQLite (Turso/libsql)                 |
| ORM              | Drizzle ORM                           |
| Authentication   | Better-Auth                           |
| Password Hashing | bcryptjs                              |
| AI Provider      | Anthropic Claude SDK                  |
| UI               | TailwindCSS v4 + Radix UI (shadcn/ui) |
| Font             | Vazirmatn (Persian)                   |
| Animations       | Framer Motion                         |
| Logging          | Pino                                  |
| Form Validation  | React Hook Form + Zod                 |
| Deployment       | Docker + Docker Compose               |

## Features

### Authentication (Better-Auth)

- Email/password sign-up and sign-in
- Session management with IP & User-Agent tracking
- Forgot / reset password (token-based)
- Email verification
- Account lockout after 5 failed attempts (15 min)
- Ready for: 2FA, passkeys, magic link, phone number, username, organization

### AI Chat

- Conversational therapy powered by Claude (Anthropic)
- Conversation history with create / delete
- Streaming responses
- Emotion-aware responses

### Mood & Wellness

- Mood tracking with timestamped entries
- Emotion logging with scores
- Meditation tracks with audio playback and categories
- Therapeutic exercises (categorized, difficulty levels, timed)

### Subscriptions & Payments

- Subscription plans with feature limits (conversations, messages/day)
- Subscription lifecycle: pending → active → expired / canceled
- Payment processing with Iranian gateways (ZarinPal, PayPing) and Stripe architecture
- Idempotency keys for duplicate prevention

### Admin Panel

- Dashboard with statistics
- User management (CRUD, activate/deactivate, soft delete)
- Role management with RBAC permissions
- Subscription & payment oversight
- Audit log viewer
- Plan management

### Profile

- View / edit profile
- Avatar upload
- Change password
- Active session management (view & revoke)
- Account deletion with password confirmation

### Security

- Rate limiting (in-memory, 15-min window for login)
- HttpOnly secure cookies
- Input validation with Zod
- Audit logging (all critical actions)
- CSRF protection
- Secure session handling via Better-Auth
- Trust host support for production

## Project Structure

```
src/
├── app/
│   ├── (marketing)/       # Public landing, about, contact
│   ├── (auth)/            # Login, signup, forgot/reset password, verify email
│   ├── (app)/             # Authenticated app: dashboard, chat, profile,
│   │                      #   exercises, meditation, reports, analytics,
│   │                      #   billing, subscriptions, settings, session-management
│   ├── (admin)/admin/     # Admin panel: users, roles, payments, subscriptions,
│   │                      #   audit-logs, dashboard, stats
│   └── api/               # Route handlers
│       ├── auth/          # Better-Auth catch-all [...all]
│       ├── chat/          # Conversations CRUD
│       ├── admin/         # Admin APIs (users, stats, payments, subscriptions,
│       │                  #   audit-logs, plans)
│       ├── cron/          # Scheduled jobs (subscriptions)
│       ├── exercises/     # Exercises CRUD
│       ├── meditation-tracks/
│       ├── moods/         # Mood entries
│       ├── reports/       # Reports
│       ├── profile/       # User profile
│       ├── plans/         # Subscription plans (public)
│       ├── analytics/     # Analytics
│       └── health/        # Health check
├── components/            # React components (UI, chat, profile, admin)
├── contexts/              # React Context (UserContext)
├── db/                    # Drizzle schema
├── hooks/                 # Custom hooks (useChat, useToast, useAudioPlayer)
├── lib/                   # Utilities (auth, db, logger, audit, rate-limit,
│                          #   validators, email, services)
└── types/                 # TypeScript types (auth, permissions, roles)
```

## Database Tables

**Better-Auth (auto-managed):** `user`, `session`, `account`, `verification`

**Business tables:**

| Table                | Purpose                                  |
| -------------------- | ---------------------------------------- |
| `subscription_plans` | Plan definitions with feature limits     |
| `subscriptions`      | User subscriptions with status lifecycle |
| `payments`           | Payment records with gateway references  |
| `conversations`      | Chat conversation containers             |
| `messages`           | Chat messages (user / assistant)         |
| `exercises`          | Therapeutic exercises                    |
| `reports`            | Weekly/monthly user reports              |
| `emotion_logs`       | Emotion tracking entries                 |
| `mood_entries`       | Mood tracking entries                    |
| `meditation_tracks`  | Meditation audio tracks                  |
| `audit_logs`         | System audit trail                       |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd arama

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values (Turso URL, auth secret, API keys)

# Push schema to database
npm run db:push

# Seed initial data (admin user, plans, exercises, etc.)
npm run db:seed

# Start dev server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `npm run dev`         | Start development server (port 3000) |
| `npm run build`       | Production build                     |
| `npm run start`       | Start production server (port 3000)  |
| `npm run lint`        | Run ESLint                           |
| `npm run typecheck`   | TypeScript type checking             |
| `npm run db:generate` | Generate Drizzle migrations          |
| `npm run db:push`     | Push schema to database              |
| `npm run db:migrate`  | Run migrations                       |
| `npm run db:studio`   | Open Drizzle Studio                  |
| `npm run db:seed`     | Seed database                        |

### Environment Variables

```env
# Database (Turso)
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your_token

# Auth
AUTH_SECRET=your_secret_here

# AI Provider
ANTHROPIC_API_KEY=your_claude_key

# Email
RESEND_API_KEY=your_key
EMAIL_FROM=noreply@yourdomain.com

# Payment Gateways
ZARINPAL_MERCHANT_ID=your_id
ZARINPAL_SANDBOX=true
PAYPING_API_TOKEN=your_token
PAYPING_SANDBOX=true

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Docker

```bash
# Build and run
docker compose up -d

# The app is available at http://localhost:3000
```

The Dockerfile uses a multi-stage build (deps → builder → runner) with standalone output for minimal image size.

## Route Groups

| Group         | Purpose              | Auth Required    |
| ------------- | -------------------- | ---------------- |
| `(marketing)` | Public landing pages | No               |
| `(auth)`      | Authentication flows | No               |
| `(app)`       | Main application     | Yes              |
| `(admin)`     | Admin panel          | Yes (admin role) |

## RBAC

Roles managed via Better-Auth admin plugin:

| Role          | Capabilities                                                  |
| ------------- | ------------------------------------------------------------- |
| `user`        | Default — chat, profile, exercises, meditation, mood, reports |
| `admin`       | User management, payments, subscriptions, audit logs, plans   |
| `super_admin` | Full access including role management                         |

## License

Private — All rights reserved.
