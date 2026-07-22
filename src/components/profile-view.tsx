"use client";

import { useEffect, useState, type FormEvent, useRef } from "react";
import { Camera, Check, RefreshCw, UserRound, WifiOff } from "lucide-react";

type Profile = {
  userId: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  timezone: string;
  remindersEnabled: boolean;
};

export function ProfileView() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/profile", { cache: "no-store" });
      const data = (await response.json()) as { profile?: Profile; error?: string };
      if (!response.ok) throw new Error(data.error || "بارگذاری نشد.");
      setProfile(data.profile ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "پروفایل بارگذاری نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const timezone = String(formData.get("timezone") ?? "Asia/Tehran");
    if (name.length < 2) { setSaveError("نامت را کامل بنویس."); return; }
    setSaving(true); setSaveError(""); setSaved(false);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, timezone, remindersEnabled: profile.remindersEnabled }),
      });
      const data = (await response.json()) as { profile?: Profile; error?: string };
      if (!response.ok) throw new Error(data.error || "ذخیره نشد.");
      setProfile(data.profile ?? profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "ذخیره انجام نشد.");
    } finally { setSaving(false); }
  };

  const changePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentPassword = String(formData.get("currentPassword") ?? "").trim();
    const newPassword = String(formData.get("newPassword") ?? "").trim();
    const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();
    if (!currentPassword || !newPassword) { setPasswordError("همهٔ فیلدها را پر کن."); return; }
    if (newPassword.length < 8) { setPasswordError("رمز جدید باید دست‌کم ۸ نویسه باشد."); return; }
    if (newPassword !== confirmPassword) { setPasswordError("رمز جدید و تکرار آن یکی نیست."); return; }
    setPasswordSaving(true); setPasswordError(""); setPasswordSaved(false);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await response.json()) as { profile?: Profile; error?: string };
      if (!response.ok) throw new Error(data.error || "تغییر رمز انجام نشد.");
      setPasswordSaved(true);
      setShowPasswordForm(false);
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "تغییر رمز انجام نشد.");
    } finally { setPasswordSaving(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate size - max 2MB
    if (file.size > 2 * 1024 * 1024) { setSaveError("حجم عکس باید کمتر از ۲ مگابایت باشد."); return; }
    // Convert to data URL and save
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
        setProfile(data.profile ?? { ...profile!, avatarUrl });
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "آپلود عکس انجام نشد.");
      } finally { setSaving(false); }
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
        <button type="button" onClick={() => void load()} className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-deep px-5 py-2.5 text-xs font-bold text-onbrand"><RefreshCw className="size-3.5" />تلاش دوباره</button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card-soft rounded-[1.75rem] p-7">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className="size-20 rounded-full object-cover" />
            ) : (
              <span className="grid size-20 place-items-center rounded-full bg-gradient-to-br from-brand-glow to-brand-deep text-3xl font-black text-white">
                {(profile.name ?? "").trim().charAt(0) || "آ"}
              </span>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
              aria-label="تغییر عکس پروفایل"
              className="absolute -bottom-1 -end-1 grid size-8 place-items-center rounded-full border-2 border-card bg-brand-deep text-onbrand transition-all hover:scale-110 disabled:opacity-60"
            >
              <Camera className="size-4" />
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          <h2 className="mt-4 text-xl font-black text-ink">{profile.name || "کاربر جدید"}</h2>
          <p className="mt-1 text-sm text-faint" dir="ltr">{profile.email || ""}</p>
        </div>

        {/* Profile form */}
        <form onSubmit={(e) => void save(e)} className="mt-8 space-y-5">
          <div>
            <label htmlFor="profile-name" className="mb-2 block text-sm font-bold text-ink">نام</label>
            <input id="profile-name" name="name" type="text" defaultValue={profile.name ?? ""}
              className="w-full rounded-2xl border border-line bg-canvas/60 py-3.5 px-4 text-sm text-ink outline-none transition-all focus:border-brand focus:bg-card focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand)_14%,transparent)]" />
          </div>
          <div>
            <label htmlFor="profile-email" className="mb-2 block text-sm font-bold text-ink">ایمیل</label>
            <input id="profile-email" type="email" dir="ltr" disabled value={profile.email ?? ""}
              className="w-full rounded-2xl border border-line bg-tint py-3.5 px-4 text-sm text-faint" />
            <p className="mt-2 text-[11px] text-faint">ایمیل فعلاً قابل تغییر نیست.</p>
          </div>
          <div>
            <label htmlFor="profile-timezone" className="mb-2 block text-sm font-bold text-ink">منطقهٔ زمانی</label>
            <select id="profile-timezone" name="timezone" defaultValue={profile.timezone}
              className="w-full rounded-2xl border border-line bg-canvas/60 py-3.5 px-4 text-sm text-ink outline-none transition-all focus:border-brand focus:bg-card">
              <option value="Asia/Tehran">تهران (UTC+3:30)</option>
              <option value="Asia/Kabul">کابل (UTC+4:30)</option>
              <option value="Asia/Dubai">دبی (UTC+4)</option>
              <option value="Europe/Istanbul">استانبول (UTC+3)</option>
              <option value="Europe/London">لندن (UTC+0/+1)</option>
              <option value="America/Toronto">تورنتو (UTC-5/-4)</option>
              <option value="America/Los_Angeles">لس‌آنجلس (UTC-8/-7)</option>
            </select>
          </div>

          {saveError && <p role="alert" className="text-xs font-semibold text-danger">{saveError}</p>}

          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-brand-deep px-6 py-3.5 text-sm font-bold text-onbrand shadow-[var(--shadow-brand)] transition-all duration-500 hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:opacity-70">
            {saving ? <><span className="animate-breathe size-3 rounded-full bg-onbrand" />در حال ذخیره…</> : saved ? <><Check className="size-4" />ذخیره شد</> : "ذخیرهٔ تغییرات"}
          </button>
        </form>

        {/* Change password */}
        <div className="mt-10 border-t border-line pt-7">
          <h3 className="text-base font-extrabold text-ink">تغییر رمز عبور</h3>
          {!showPasswordForm ? (
            <button type="button" onClick={() => setShowPasswordForm(true)} className="mt-3 rounded-full border border-line px-5 py-2.5 text-xs font-bold text-soft transition-colors hover:border-brand/40 hover:text-brand-ink">
              تغییر رمز
            </button>
          ) : (
            <form onSubmit={(e) => void changePassword(e)} className="mt-4 space-y-4">
              <div>
                <label htmlFor="current-pass" className="mb-2 block text-sm font-bold text-ink">رمز فعلی</label>
                <input id="current-pass" name="currentPassword" type="password" autoComplete="current-password"
                  className="w-full rounded-2xl border border-line bg-canvas/60 py-3.5 px-4 text-sm text-ink outline-none transition-all focus:border-brand focus:bg-card" />
              </div>
              <div>
                <label htmlFor="new-pass" className="mb-2 block text-sm font-bold text-ink">رمز جدید</label>
                <input id="new-pass" name="newPassword" type="password" autoComplete="new-password" placeholder="دست‌کم ۸ نویسه"
                  className="w-full rounded-2xl border border-line bg-canvas/60 py-3.5 px-4 text-sm text-ink outline-none transition-all focus:border-brand focus:bg-card" />
              </div>
              <div>
                <label htmlFor="confirm-pass" className="mb-2 block text-sm font-bold text-ink">تکرار رمز جدید</label>
                <input id="confirm-pass" name="confirmPassword" type="password" autoComplete="new-password"
                  className="w-full rounded-2xl border border-line bg-canvas/60 py-3.5 px-4 text-sm text-ink outline-none transition-all focus:border-brand focus:bg-card" />
              </div>
              {passwordError && <p role="alert" className="text-xs font-semibold text-danger">{passwordError}</p>}
              {passwordSaved && <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-ink"><Check className="size-3.5" />رمز عبور با موفقیت تغییر کرد.</p>}
              <div className="flex items-center gap-3">
                <button type="submit" disabled={passwordSaving}
                  className="rounded-full bg-brand-deep px-5 py-2.5 text-xs font-bold text-onbrand shadow-[var(--shadow-brand)] disabled:opacity-70">
                  {passwordSaving ? "در حال ذخیره…" : "ذخیرهٔ رمز جدید"}
                </button>
                <button type="button" onClick={() => { setShowPasswordForm(false); setPasswordError(""); }}
                  className="text-xs font-bold text-faint hover:text-ink">انصراف</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
