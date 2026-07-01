# Route Inventory

## App Pages

| Route | Source |
| --- | --- |
| `/` | `src/app/(marketing)/page.tsx` |
| `/about` | `src/app/(marketing)/about/page.tsx` |
| `/contact` | `src/app/(marketing)/contact/page.tsx` |
| `/login` | `src/app/(auth)/login/page.tsx` |
| `/signup` | `src/app/(auth)/signup/page.tsx` |
| `/forgot-password` | `src/app/(auth)/forgot-password/page.tsx` |
| `/reset-password/[token]` | `src/app/(auth)/reset-password/[token]/page.tsx` |
| `/verify-email/[token]` | `src/app/(auth)/verify-email/[token]/page.tsx` |
| `/dashboard` | `src/app/(app)/dashboard/page.tsx` |
| `/dashboard/[...slug]` | `src/app/(app)/dashboard/[...slug]/page.tsx` |
| `/chat` | `src/app/(app)/chat/page.tsx` |
| `/analytics` | `src/app/(app)/analytics/page.tsx` |
| `/billing` | `src/app/(app)/billing/page.tsx` |
| `/exercises` | `src/app/(app)/exercises/page.tsx` |
| `/meditation` | `src/app/(app)/meditation/page.tsx` |
| `/profile` | `src/app/(app)/profile/page.tsx` |
| `/profile/security` | `src/app/(app)/profile/security/page.tsx` |
| `/reports` | `src/app/(app)/reports/page.tsx` |
| `/settings` | `src/app/(app)/settings/page.tsx` |
| `/session-management` | `src/app/(app)/session-management/page.tsx` |
| `/subscriptions` | `src/app/(app)/subscriptions/page.tsx` |
| `/admin/dashboard` | `src/app/(admin)/admin/dashboard/page.tsx` |
| `/admin/audit-logs` | `src/app/(admin)/admin/audit-logs/page.tsx` |
| `/admin/payments` | `src/app/(admin)/admin/payments/page.tsx` |
| `/admin/roles` | `src/app/(admin)/admin/roles/page.tsx` |
| `/admin/subscriptions` | `src/app/(admin)/admin/subscriptions/page.tsx` |
| `/admin/users` | `src/app/(admin)/admin/users/page.tsx` |

## API Routes

| Route | Source |
| --- | --- |
| `/api/auth/[...all]` | `src/app/api/auth/[...all]/route.ts` |
| `/api/admin/audit-logs` | `src/app/api/admin/audit-logs/route.ts` |
| `/api/admin/payments` | `src/app/api/admin/payments/route.ts` |
| `/api/admin/plans` | `src/app/api/admin/plans/route.ts` |
| `/api/admin/plans/[id]` | `src/app/api/admin/plans/[id]/route.ts` |
| `/api/admin/stats` | `src/app/api/admin/stats/route.ts` |
| `/api/admin/subscriptions` | `src/app/api/admin/subscriptions/route.ts` |
| `/api/analytics` | `src/app/api/analytics/route.ts` |
| `/api/chat/conversations` | `src/app/api/chat/conversations/route.ts` |
| `/api/chat/conversations/[id]` | `src/app/api/chat/conversations/[id]/route.ts` |
| `/api/chat/conversations/[id]/messages` | `src/app/api/chat/conversations/[id]/messages/route.ts` |
| `/api/chat/conversations/[id]/messages/[messageId]` | `src/app/api/chat/conversations/[id]/messages/[messageId]/route.ts` |
| `/api/cron/subscriptions` | `src/app/api/cron/subscriptions/route.ts` |
| `/api/exercises` | `src/app/api/exercises/route.ts` |
| `/api/health` | `src/app/api/health/route.ts` |
| `/api/meditation-tracks` | `src/app/api/meditation-tracks/route.ts` |
| `/api/moods` | `src/app/api/moods/route.ts` |
| `/api/payments/callback` | `src/app/api/payments/callback/route.ts` |
| `/api/payments/create` | `src/app/api/payments/create/route.ts` |
| `/api/payments/history` | `src/app/api/payments/history/route.ts` |
| `/api/payments/refund` | `src/app/api/payments/refund/route.ts` |
| `/api/plans` | `src/app/api/plans/route.ts` |
| `/api/reports` | `src/app/api/reports/route.ts` |
| `/api/subscriptions/active` | `src/app/api/subscriptions/active/route.ts` |
| `/api/subscriptions/cancel` | `src/app/api/subscriptions/cancel/route.ts` |
| `/api/subscriptions/current` | `src/app/api/subscriptions/current/route.ts` |
| `/api/subscriptions/history` | `src/app/api/subscriptions/history/route.ts` |
| `/api/subscriptions/renew` | `src/app/api/subscriptions/renew/route.ts` |
