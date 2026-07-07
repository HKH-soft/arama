# آراما - سیستم مدیریت کاربران و اشتراک

## توضیحات پروژه

سیستم مدیریت کاربران و اشتراک (User & Subscription Management System) در سطح Production با استفاده از Next.js، TypeScript، Drizzle ORM، SQLite، Better-Auth و سایر تکنولوژی‌های مدرن.

## ویژگی‌های سیستم

### تکنولوژی‌های مورد استفاده

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database ORM**: Drizzle ORM
- **Database**: SQLite
- **Authentication**: Better-Auth
- **Password Hashing**: Argon2
- **UI Framework**: TailwindCSS + Radix UI
- **State Management**: React Context (UserContext)
- **Form Validation**: React Hook Form + Zod
- **RBAC**: Role Based Access Control
- **API**: Next.js Route Handlers
- **Background Jobs**: Cron Jobs
- **Logging**: Winston
- **Email Service**: Nodemailer
- **Payment Architecture**: قابل اتصال به Stripe یا درگاه‌های ایرانی
- **Deployment Ready**: Docker + Docker Compose

### قابلیت‌های احراز هویت

1. ثبت‌نام کاربران
2. ورود کاربران
3. خروج از سیستم
4. مدیریت Session
5. Session Timeout پس از عدم فعالیت
6. Refresh Session
7. Forgot Password
8. Reset Password با Token یکبار مصرف
9. Change Password
10. Email Verification

### الزامات امنیتی

- استفاده از Argon2 برای Hash رمز عبور
- رمزها هرگز به صورت Plain Text ذخیره نمی‌شوند
- حداقل طول رمز: 8 کاراکتر
- رمز باید شامل حروف کوچک، بزرگ، عدد و کاراکتر ویژه باشد
- Rate Limiting برای Login API
- پس از 5 بار تلاش ناموفق، حساب 15 دقیقه قفل می‌شود
- استفاده از CSRF Protection
- استفاده از Secure Cookies و HttpOnly Cookies
- فعال‌سازی Helmet Security Headers
- جلوگیری از Brute Force
- اعتبارسنجی کامل ورودی‌ها با Zod

### سیستم Session

- Session اختصاصی پس از Login
- ذخیره IP و User Agent
- ذخیره زمان آخرین فعالیت
- نمایش Session‌های فعال کاربر
- امکان Logout از سایر Session‌ها
- منقضی شدن Session‌ها پس از 30 دقیقه عدم فعالیت

### مدیریت پروفایل

- مشاهده پروفایل
- ویرایش پروفایل
- آپلود تصویر پروفایل
- تغییر رمز عبور
- مشاهده Session‌های فعال
- **حذف حساب کاربری با تأیید رمز عبور**
- **نشان دادن نشست‌های واقعی از دیتابیس (نه داده‌های دمو)**
- **نویگیشن به پروفایل با کلیک روی آواتار در نوار ناوبری و سایدبار ادمین**

### انیمیشن‌های ساده شده

- تمام مودال‌ها (Dialog، AlertDialog، Sheet، Popover، DropdownMenu، Tooltip، HoverCard) از انیمیشن‌های پیچیده zoom/slide حذف شده‌اند
- فقط انیمیشن fade-in ساده باقی مانده
- برای Dialog از scale-in هم استفاده شده

### RBAC

- سیستم کاملاً Role-Based
- ایجاد، حذف و ویرایش Role
- تخصیص Role به کاربران
- تخصیص Permission به Role
- نقش‌های پیش‌فرض: Super Admin، Admin، User
- Super Admin هنگام Seed اولیه ایجاد می‌شود

### مدیریت کاربران توسط Admin

- ایجاد کاربر
- ویرایش کاربر
- غیرفعال‌سازی کاربر
- فعال‌سازی مجدد
- جستجو کاربران
- فیلتر کاربران
- Pagination
- استفاده از Soft Delete

### Audit Log

- ذخیره تمام رویدادهای مهم
- Login، Logout، Failed Login، Password Change، Profile Update
- User Management Actions، Subscription Actions، Payment Events

### سیستم اشتراک

- ایجاد، ویرایش و حذف (منطقی) پلن
- پلن‌های: Free، Monthly، Yearly، Professional
- هر پلن شامل title، description، price، durationDays، features، isActive

### Subscription Management

- خرید اشتراک
- تمدید اشتراک
- لغو اشتراک
- وضعیت‌های: ACTIVE، EXPIRED، CANCELED، PENDING_PAYMENT
- فقط یک اشتراک فعال در هر زمان

### سیستم پرداخت

- قابل اتصال به Stripe و درگاه‌های ایرانی
- وضعیت‌های: PENDING، SUCCESS، FAILED، REFUNDED

### کنترل دسترسی

- بررسی Authentication، Role، Permission
- بررسی وضعیت اشتراک و امکانات پلن
- Middleware‌های جداگانه: requireAuth، requireRole، requirePermission، requireSubscription

### اعلان‌ها

- ایمیل قبل از پایان اشتراک (7، 3، 1 روز قبل)
- اعلان‌های موفق/ناموفق بودن پرداخت و پایان اشتراک

## نحوه اجرا

### پیش‌نیازها

- Node.js 18+

### نصب و راه‌اندازی

1. کلون کردن مخزن:

```bash
git clone <repository-url>
cd arama
```

2. نصب وابستگی‌ها:

```bash
npm install
```

3. پیکربندی محیط:

```bash
cp .env.example .env
# ویرایش فایل .env با مقادیر مناسب
```

4. اجرای دیتابیس:

```bash
npm run db:push
npm run db:generate
```

5. اجرای seed:

```bash
npm run db:seed
```

6. اجرای برنامه:

```bash
npm run dev
```

### استفاده از Docker

1. ایجاد فایل .env:

```bash
cp .env.example .env
# ویرایش فایل .env با مقادیر مناسب
```

2. اجرای سرویس‌ها:

```bash
docker-compose up -d
```

## ساختار پوشه‌ها

```
src/
├── app/                 # صفحات برنامه (Next.js App Router)
│   ├── (admin)/         # صفحات مدیریت
│   ├── (app)/           # صفحات کاربری
│   ├── (auth)/          # صفحات احراز هویت
│   └── api/             # API routeها
├── components/          # کامپوننت‌های UI و ویژگی‌محور
│   ├── admin/           # کامپوننت‌های مدیریت
│   ├── chat/            # کامپوننت‌های چت
│   ├── profile/         # کامپوننت‌های پروفایل
│   └── ui/              # کامپوننت‌های Radix UI
├── hooks/              # هوک‌های سفارشی
├── lib/                # کتابخانه‌ها و خدمات
│   ├── cron/           # کران جاب‌ها
│   ├── email/          # سرویس ایمیل
│   ├── services/       # سرویس‌های تجاری
│   └── validators/     # اعتبارسنجی‌ها
├── db/                 # schema دیتابیس Drizzle
├── types/              # تعریف نوع‌ها
└── middleware.ts       # میدل‌ورهای Next.js
```

## API Endpoints

### احراز هویت

- `POST /api/auth/register` - ثبت‌نام
- `POST /api/auth/login` - ورود
- `POST /api/auth/logout` - خروج
- `POST /api/auth/forgot-password` - فراموشی رمز
- `POST /api/auth/reset-password` - بازنشانی رمز
- `POST /api/auth/change-password` - تغییر رمز

### مدیریت کاربران (Admin)

- `GET /api/admin/users` - دریافت لیست کاربران
- `POST /api/admin/users` - ایجاد کاربر
- `PUT /api/admin/users/:id` - ویرایش کاربر
- `DELETE /api/admin/users/:id` - حذف کاربر

### مدیریت پروفایل

- `GET /api/profile` - دریافت پروفایل کاربر
- `PUT /api/profile` - ویرایش پروفایل
- `DELETE /api/profile` - حذف حساب کاربری
- `GET /api/profile/sessions` - دریافت نشست‌های فعال
- `POST /api/profile/sessions/revoke` - لغو نشست

### مدیریت اشتراک‌ها

- `GET /api/subscriptions/active` - دریافت اشتراک فعال
- `POST /api/subscriptions/renew` - تمدید اشتراک
- `POST /api/subscriptions/cancel` - لغو اشتراک
- `GET /api/subscriptions/history` - تاریخچه اشتراک

### مدیریت پرداخت‌ها

- `POST /api/payments/create` - ایجاد پرداخت
- `GET /api/payments/history` - تاریخچه پرداخت
- `POST /api/payments/refund` - استرداد پرداخت

## توسعه

### اضافه کردن مجوز جدید

1. افزودن مجوز در فایل seed.ts
2. استفاده از `requirePermission('permission:name')` در route

### اضافه کردن نقش جدید

1. افزودن نقش در فایل seed.ts
2. اختصاص مجوزها به نقش
3. استفاده از `requireRole('role-name')` در route

### اضافه کردن پلن جدید

1. افزودن پلن در فایل seed.ts
2. به‌روزرسانی UI مدیریت پلن‌ها

## تست‌ها

### اجرای تست‌ها

```bash
npm test
```

### تست واحد

```bash
npm run test:unit
```

### تست یکپارچه‌سازی

```bash
npm run test:integration
```

## استقرار

### استقرار در محیط Production

1. استفاده از Docker Compose
2. پیکربندی محیط Production
3. مدیریت SSL/TLS
4. پیکربندی CDN برای فایل‌های استاتیک

## امنیت

- کد به صورت امن نوشته شده است
- تمام ورودی‌ها اعتبارسنجی می‌شوند
- استفاده از Prepared Statements برای جلوگیری از SQL Injection
- استفاده از Content Security Policy
- محافظت در برابر XSS و CSRF

## مجوز

MIT
