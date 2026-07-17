"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Check, RefreshCw, WifiOff } from "lucide-react";

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
