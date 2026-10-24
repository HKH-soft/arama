"use client";

import { useEffect, useState, type FormEvent, useRef } from "react";
import {
  Calendar,
  Camera,
  Check,
  CreditCard,
  KeyRound,
  Lock,
  LogOut,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Profile = {
  userId: string;
  phone?: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  timezone: string;
  remindersEnabled: boolean;
  hasPassword?: boolean;
  createdAt?: string;
};

type Subscription = {
  status: string;
  planName?: string;
};

export function ProfileView() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Password set/change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Logout
  const [loggingOut, setLoggingOut] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [profileRes, subRes] = await Promise.all([
        fetch("/api/profile", { cache: "no-store" }),
        fetch("/api/subscription", { cache: "no-store" }),
      ]);

      const data = (await profileRes.json()) as { profile?: Profile; error?: string };
      if (!profileRes.ok) throw new Error(data.error || "بارگذاری نشد.");
      setProfile(data.profile ?? null);

      if (subRes.ok) {
        const subData = await subRes.json();
        setSub({
          status: subData.subscription?.subscription?.status || "inactive",
          planName: subData.subscription?.plan?.name || "پلن رایگان",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "پروفایل بارگذاری نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim() || null;
    const timezone = String(formData.get("timezone") ?? "Asia/Tehran");
    
    if (name.length < 2) {
      setSaveError("نامت را کامل بنویس (حداقل ۲ نویسه).");
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaved(false);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          timezone,
          remindersEnabled: profile.remindersEnabled,
        }),
      });
      const data = (await response.json()) as { profile?: Profile; error?: string };
      if (!response.ok) throw new Error(data.error || "ذخیره نشد.");
      setProfile(data.profile ?? profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "ذخیره انجام نشد.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentPassword = String(formData.get("currentPassword") ?? "").trim();
    const newPassword = String(formData.get("newPassword") ?? "").trim();
    const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

    if (profile?.hasPassword && !currentPassword) {
      setPasswordError("رمز عبور فعلی الزامی است.");
      return;
    }
    if (!newPassword) {
      setPasswordError("رمز عبور جدید را وارد کنید.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("رمز عبور جدید باید حداقل ۸ نویسه باشد.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("رمز عبور جدید و تکرار آن یکسان نیستند.");
      return;
    }

    setPasswordSaving(true);
    setPasswordError("");
    setPasswordSaved(false);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          currentPassword: profile?.hasPassword ? currentPassword : undefined,
          newPassword,
        }),
      });
      const data = (await response.json()) as { profile?: Profile; error?: string };
      if (!response.ok) throw new Error(data.error || "تغییر رمز انجام نشد.");
      
      setProfile((prev) => (prev ? { ...prev, hasPassword: true } : prev));
      setPasswordSaved(true);
      setTimeout(() => {
        setPasswordSaved(false);
        setShowPasswordForm(false);
      }, 2500);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "تغییر رمز انجام نشد.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setSaveError("حجم عکس باید کمتر از ۲ مگابایت باشد.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const avatarUrl = event.target?.result as string;
      setSaving(true);
      try {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ avatarUrl }),
        });
        const data = (await res.json()) as { profile?: Profile; error?: string };
        if (!res.ok) throw new Error(data.error || "ذخیره نشد.");
        setProfile((prev) => (prev ? { ...prev, avatarUrl } : prev));
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "آپلود عکس انجام نشد.");
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="card-soft mx-auto max-w-2xl rounded-[1.75rem] p-7">
        <div className="calm-skeleton mx-auto size-20 rounded-full" />
        <div className="calm-skeleton mx-auto mt-5 h-5 w-40 rounded-full" />
        <div className="calm-skeleton mx-auto mt-3 h-4 w-56 rounded-full" />
        <div className="calm-skeleton mt-8 h-12 w-full rounded-2xl" />
        <div className="calm-skeleton mt-4 h-12 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-soft mx-auto max-w-2xl rounded-[1.75rem] p-12 text-center">
        <WifiOff className="mx-auto size-8 text-danger" />
        <p className="mt-4 text-sm font-bold text-ink">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-deep px-5 py-2.5 text-xs font-bold text-onbrand"
        >
          <RefreshCw className="size-3.5" />
          تلاش دوباره
        </button>
      </div>
    );
  }

  if (!profile) return null;

  const formattedJoinDate = profile.createdAt
    ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date(profile.createdAt))
    : "به تازگی";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Account Overview Header */}
      <div className="card-soft rounded-[1.75rem] p-7">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt="آواتار"
                width={88}
                height={88}
                className="size-22 rounded-full object-cover ring-4 ring-brand/10"
              />
            ) : (
              <span className="grid size-22 place-items-center rounded-full bg-gradient-to-br from-brand-glow to-brand-deep text-3xl font-black text-white shadow-md">
                {(profile.name ?? "").trim().charAt(0) || "آ"}
              </span>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
              aria-label="تغییر عکس پروفایل"
              className="absolute -bottom-1 -end-1 grid size-8 place-items-center rounded-full border-2 border-card bg-brand-deep text-onbrand shadow transition-all hover:scale-110 disabled:opacity-60"
            >
              <Camera className="size-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          <div className="flex-1 text-center sm:text-start min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-ink">{profile.name || "کاربر آراما"}</h2>
                <div className="mt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  {profile.phone && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-tint-strong px-3 py-1 text-xs font-bold text-brand-ink" dir="ltr">
                      <Phone className="size-3" />
                      {profile.phone}
                      <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-faint">
                    <Calendar className="size-3" />
                    عضویت: {formattedJoinDate}
                  </span>
                </div>
              </div>

              {/* Subscription pill */}
              <Link
                href="/billing"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line bg-canvas/60 px-3.5 py-2 text-xs font-bold text-ink transition-colors hover:border-brand/40 hover:bg-tint"
              >
                <CreditCard className="size-3.5 text-brand-ink" />
                <span>{sub?.planName || "پلن رایگان"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Edit Form */}
      <div className="card-soft rounded-[1.75rem] p-7">
        <h3 className="text-base font-extrabold text-ink flex items-center gap-2">
          <UserRound className="size-4.5 text-brand-ink" />
          اطلاعات شخصی
        </h3>
        <p className="mt-1 text-xs text-soft">
          نام شما در پیام‌ها و گزارش‌های شخصی آراما نمایش داده می‌شود.
        </p>

        <form onSubmit={(e) => void save(e)} className="mt-6 space-y-5">
          <div>
            <label htmlFor="profile-name" className="mb-2 block text-sm font-bold text-ink">
              نام و نام‌خانوادگی
            </label>
            <input
              id="profile-name"
              name="name"
              type="text"
              defaultValue={profile.name ?? ""}
              placeholder="نامت را اینجا بنویس"
              className="w-full rounded-2xl border border-line bg-canvas/60 py-3.5 px-4 text-sm text-ink outline-none transition-all focus:border-brand focus:bg-card focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand)_14%,transparent)]"
            />
          </div>

          <div>
            <label htmlFor="profile-phone" className="mb-2 block text-sm font-bold text-ink">
              شماره تلفن همراه (احراز هویت پیامکی)
            </label>
            <div className="relative">
              <input
                id="profile-phone"
                type="text"
                dir="ltr"
                disabled
                value={profile.phone ?? "ثبت‌نشده"}
                className="w-full rounded-2xl border border-line bg-tint/80 py-3.5 px-4 text-sm font-bold text-ink"
              />
              <span className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                تأییدشده
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-faint">
              شماره موبایل جهت امنیت حساب قفل است و برای بازیابی رمز عبور استفاده می‌شود.
            </p>
          </div>

          <div>
            <label htmlFor="profile-email" className="mb-2 block text-sm font-bold text-ink">
              آدرس ایمیل (اختیاری)
            </label>
            <input
              id="profile-email"
              name="email"
              type="email"
              dir="ltr"
              defaultValue={profile.email ?? ""}
              placeholder="example@mail.com"
              className="w-full rounded-2xl border border-line bg-canvas/60 py-3.5 px-4 text-sm text-ink outline-none transition-all focus:border-brand focus:bg-card"
            />
          </div>

          <div>
            <label htmlFor="profile-timezone" className="mb-2 block text-sm font-bold text-ink">
              منطقهٔ زمانی
            </label>
            <select
              id="profile-timezone"
              name="timezone"
              defaultValue={profile.timezone}
              className="w-full rounded-2xl border border-line bg-canvas/60 py-3.5 px-4 text-sm text-ink outline-none transition-all focus:border-brand focus:bg-card"
            >
              <option value="Asia/Tehran">تهران (UTC+3:30)</option>
              <option value="Asia/Kabul">کابل (UTC+4:30)</option>
              <option value="Asia/Dubai">دبی (UTC+4)</option>
              <option value="Europe/Istanbul">استانبول (UTC+3)</option>
              <option value="Europe/London">لندن (UTC+0/+1)</option>
              <option value="America/Toronto">تورنتو (UTC-5/-4)</option>
              <option value="America/Los_Angeles">لس‌آنجلس (UTC-8/-7)</option>
            </select>
          </div>

          {saveError && (
            <p role="alert" className="text-xs font-semibold text-danger">
              {saveError}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-brand-deep px-6 py-3 text-sm font-bold text-onbrand shadow-[var(--shadow-brand)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-70"
            >
              {saving ? (
                <>
                  <span className="size-3.5 rounded-full border-2 border-onbrand border-t-transparent animate-spin" />
                  در حال ذخیره…
                </>
              ) : saved ? (
                <>
                  <Check className="size-4" />
                  ذخیره شد
                </>
              ) : (
                "ذخیرهٔ تغییرات"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Password Management Card */}
      <div className="card-soft rounded-[1.75rem] p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-ink flex items-center gap-2">
              <KeyRound className="size-4.5 text-brand-ink" />
              {profile.hasPassword ? "تغییر رمز عبور" : "تعیین رمز عبور حساب"}
            </h3>
            <p className="mt-1.5 text-xs leading-6 text-soft">
              {profile.hasPassword
                ? "می‌توانی رمز ورود به حساب کاربری‌ات را تغییر دهی."
                : "با تعیین رمز، بدون نیاز به دریافت کد پیامکی می‌توانید با شماره موبایل و رمز وارد حساب شوید."}
            </p>
          </div>

          {!showPasswordForm && (
            <button
              type="button"
              onClick={() => {
                setShowPasswordForm(true);
                setPasswordError("");
              }}
              className="shrink-0 rounded-full border border-line bg-canvas/60 px-4 py-2 text-xs font-bold text-ink transition-colors hover:border-brand/40 hover:text-brand-ink"
            >
              {profile.hasPassword ? "تغییر رمز" : "تعیین رمز عبور"}
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={(e) => void handlePasswordSubmit(e)} className="mt-6 space-y-4 border-t border-line pt-6">
            {profile.hasPassword && (
              <div>
                <label htmlFor="current-pass" className="mb-2 block text-xs font-bold text-ink">
                  رمز عبور فعلی
                </label>
                <input
                  id="current-pass"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  placeholder="رمز فعلی حسابت را وارد کن"
                  className="w-full rounded-2xl border border-line bg-canvas/60 py-3 px-4 text-sm text-ink outline-none transition-all focus:border-brand focus:bg-card"
                />
              </div>
            )}

            <div>
              <label htmlFor="new-pass" className="mb-2 block text-xs font-bold text-ink">
                رمز عبور جدید
              </label>
              <input
                id="new-pass"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                placeholder="حداقل ۸ نویسه"
                className="w-full rounded-2xl border border-line bg-canvas/60 py-3 px-4 text-sm text-ink outline-none transition-all focus:border-brand focus:bg-card"
              />
            </div>

            <div>
              <label htmlFor="confirm-pass" className="mb-2 block text-xs font-bold text-ink">
                تکرار رمز عبور جدید
              </label>
              <input
                id="confirm-pass"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="رمز جدید را دوباره وارد کن"
                className="w-full rounded-2xl border border-line bg-canvas/60 py-3 px-4 text-sm text-ink outline-none transition-all focus:border-brand focus:bg-card"
              />
            </div>

            {passwordError && (
              <p role="alert" className="text-xs font-semibold text-danger">
                {passwordError}
              </p>
            )}

            {passwordSaved && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="size-3.5" />
                رمز عبور با موفقیت ثبت شد.
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={passwordSaving}
                className="rounded-full bg-brand-deep px-5 py-2.5 text-xs font-bold text-onbrand shadow-[var(--shadow-brand)] disabled:opacity-70"
              >
                {passwordSaving ? "در حال ذخیره…" : profile.hasPassword ? "ثبت رمز جدید" : "ثبت و فعال‌سازی رمز"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordError("");
                }}
                className="text-xs font-bold text-faint hover:text-ink px-3 py-2"
              >
                انصراف
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Account Actions / Logout */}
      <div className="card-soft rounded-[1.75rem] p-7 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-ink">خروج از حساب کاربری</h3>
          <p className="mt-1 text-xs text-soft">
            در صورت خروج، برای دسترسی مجدد باید با شماره موبایل و کد پیامکی یا رمز عبور وارد شوی.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-2 rounded-2xl border border-danger/20 bg-danger/5 px-5 py-2.5 text-xs font-bold text-danger transition-colors hover:bg-danger hover:text-white disabled:opacity-50"
        >
          <LogOut className="size-4" />
          {loggingOut ? "در حال خروج..." : "خروج از حساب"}
        </button>
      </div>
    </div>
  );
}
