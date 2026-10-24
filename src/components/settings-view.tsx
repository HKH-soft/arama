"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Check, RefreshCw, WifiOff, AlertTriangle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type Profile = {
  userId: string;
  name: string;
  email: string;
  timezone: string;
  remindersEnabled: boolean;
};

export function SettingsView() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

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

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/profile", { cache: "no-store" });
      const data = (await response.json()) as { profile?: Profile; error?: string };
      if (!response.ok) throw new Error(data.error || "بارگذاری نشد.");
      setProfile(data.profile ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تنظیمات بارگذاری نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleReminders = async () => {
    if (!profile) return;
    setSaving(true);
    setSaveError("");
    setSaved(false);
    const next = !profile.remindersEnabled;
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          timezone: profile.timezone,
          remindersEnabled: next,
        }),
      });
      const data = (await response.json()) as { profile?: Profile; error?: string };
      if (!response.ok) throw new Error(data.error || "ذخیره نشد.");
      setProfile(data.profile ?? { ...profile, remindersEnabled: next });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "ذخیرهٔ تنظیمات انجام نشد.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const response = await fetch("/api/profile/delete", { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "خطایی در حذف حساب رخ داد.");
      }
      // Redirect to home and refresh to clear local state
      router.push("/");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "حذف حساب انجام نشد.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="card-soft rounded-[1.75rem] p-7">
          <div className="calm-skeleton h-5 w-40 rounded-full" />
          <div className="calm-skeleton mt-5 h-14 w-full rounded-2xl" />
        </div>
        <div className="card-soft rounded-[1.75rem] p-7">
          <div className="calm-skeleton h-5 w-32 rounded-full" />
          <div className="calm-skeleton mt-5 h-14 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-soft rounded-[1.75rem] p-12 text-center">
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

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* reminders toggle */}
      <div className="card-soft rounded-[1.75rem] p-7">
        <h2 className="text-base font-extrabold text-ink">یادآور چک‌این روزانه</h2>
        <p className="mt-2 text-sm leading-7 text-soft">
          هر روز یک یادآوری مهربانانه دریافت کن تا حال خودت را ثبت کنی.
        </p>
        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-line bg-canvas/60 p-4">
          <div className="flex items-center gap-3">
            {profile.remindersEnabled ? (
              <Bell className="size-5 text-brand-ink" />
            ) : (
              <BellOff className="size-5 text-faint" />
            )}
            <span className="text-sm font-bold text-ink">
              {profile.remindersEnabled ? "یادآورها فعال هستند" : "یادآورها خاموش‌اند"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void toggleReminders()}
            disabled={saving}
            aria-pressed={profile.remindersEnabled}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 disabled:opacity-60 ${
              profile.remindersEnabled ? "bg-brand-deep" : "bg-line-strong"
            }`}
          >
            <span
              className={`inline-block size-5 rounded-full bg-white shadow transition-transform duration-300 ${
                profile.remindersEnabled ? "-translate-x-7" : "-translate-x-1"
              }`}
            />
          </button>
        </div>
        {saved && (
          <p className="animate-rise mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-ink">
            <Check className="size-3.5" />
            تنظیمات ذخیره شد.
          </p>
        )}
        {saveError && (
          <p role="alert" className="mt-3 text-xs font-semibold text-danger">{saveError}</p>
        )}
      </div>

      {/* theme note */}
      <div className="card-soft rounded-[1.75rem] p-7">
        <h2 className="text-base font-extrabold text-ink">حالت نمایش</h2>
        <p className="mt-2 text-sm leading-7 text-soft">
          برای تغییر بین حالت روشن و تاریک، از آیکون ماه/خورشید در نوار کناری استفاده کن.
          تنظیمات تو به‌صورت خودکار ذخیره می‌شود.
        </p>
      </div>

      {/* data management */}
      <div className="card-soft rounded-[1.75rem] p-7">
        <h2 className="text-base font-extrabold text-ink">مدیریت داده‌ها</h2>
        <p className="mt-2 text-sm leading-7 text-soft">
          تمام داده‌هایت — از گفتگوها تا ثبت خلق‌وخو — رمزنگاری و محرمانه ذخیره می‌شود.
          هر زمان بخواهی می‌توانی از صفحهٔ «تاریخچهٔ گفتگوها» آن‌ها را پاک کنی.
        </p>

        <div className="mt-8 border-t border-line pt-6 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-ink">خروج از حساب کاربری</h3>
            <p className="mt-1 text-xs text-soft">
              خروج از نشست فعلی و بازگشت به صفحه ورود.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-canvas/60 px-4 py-2 text-xs font-bold text-ink hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-colors disabled:opacity-50"
          >
            <LogOut className="size-3.5" />
            {loggingOut ? "در حال خروج..." : "خروج"}
          </button>
        </div>

        <div className="mt-6 border-t border-line pt-6">
          <h3 className="text-sm font-bold text-danger">حذف حساب کاربری</h3>
          <p className="mt-2 text-xs leading-6 text-faint">
            این عملیات غیرقابل بازگشت است و تمام پروفایل، گفتگوها، سوابق خلق‌وخو و اشتراک شما برای همیشه حذف خواهد شد.
          </p>
          
          {showDeleteConfirm ? (
            <div className="mt-4 rounded-2xl bg-danger/10 p-4 border border-danger/20">
              <p className="text-xs font-bold text-danger mb-4 flex items-center gap-2">
                <AlertTriangle className="size-4" />
                آیا کاملاً مطمئن هستید؟
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={deleteAccount}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-danger py-2.5 text-xs font-black text-white hover:bg-danger/90 disabled:opacity-50"
                >
                  {deleting ? "در حال حذف..." : "بله، حسابم را حذف کن"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-white py-2.5 text-xs font-bold text-ink hover:bg-canvas disabled:opacity-50"
                >
                  انصراف
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-4 rounded-xl bg-danger/10 px-4 py-2 text-xs font-bold text-danger hover:bg-danger hover:text-white transition-colors"
            >
              حذف برای همیشه
            </button>
          )}
        </div>
      </div>

      {/* app info */}
      <div className="card-soft rounded-[1.75rem] p-7">
        <h2 className="text-base font-extrabold text-ink">دربارهٔ آراما</h2>
        <p className="mt-2 text-sm leading-7 text-soft">
          نسخهٔ ۱.۰.۰ · ساخته‌شده با عشق در ایران
        </p>
        <p className="mt-1 text-xs leading-5 text-faint">
          آراما جایگزین درمانگر نیست. در بحران روانی حاد با اورژانس اجتماعی ۱۲۳ تماس بگیرید.
        </p>
      </div>
    </div>
  );
}
