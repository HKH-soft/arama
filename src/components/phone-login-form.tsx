"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, MessageCircle, Phone, Shield, Undo2 } from "lucide-react";

type Step = "phone" | "otp" | "password-setup";
type LoginMode = "otp" | "password";

export function PhoneLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [loginMode, setLoginMode] = useState<LoginMode>("otp");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  // true when the OTP step was reached via "forgot password" recovery,
  // so we force a "set a new password" step after verification.
  const [isRecovery, setIsRecovery] = useState(false);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /** Shared OTP request logic — used by the normal flow and the "forgot password" recovery path. */
  const sendOtp = async (targetPhone: string) => {
    setError("");
    if (!/^09\d{9}$/.test(targetPhone.trim())) {
      setError("شماره تلفن معتبر نیست. فرمت صحیح: 09xxxxxxxxx");
      return false;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: targetPhone.trim() }),
      });
      const data = (await response.json()) as { message?: string; error?: string; expiresAt?: string };
      if (!response.ok) throw new Error(data.error || "درخواست کد انجام نشد.");

      setStep("otp");
      setOtp("");
      if (data.expiresAt) {
        setExpiresAt(new Date(data.expiresAt));
        setTimeLeft(Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "درخواست کد انجام نشد.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const requestOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsRecovery(false);
    await sendOtp(phone);
  };

  const loginWithPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!/^09\d{9}$/.test(phone.trim())) {
      setError("شماره تلفن معتبر نیست. فرمت صحیح: 09xxxxxxxxx");
      return;
    }
    if (!password) {
      setError("رمز عبور را وارد کن.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/password/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "ورود انجام نشد.");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ورود انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  };

  /** "رمز عبور را فراموش کرده‌ام" — recovery always works through OTP, regardless of the saved password. */
  const forgotPassword = async () => {
    setIsRecovery(true);
    await sendOtp(phone);
  };

  const verifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!/^\d{5}$/.test(otp.trim())) {
      setError("کد باید ۵ رقم باشد.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), code: otp.trim() }),
      });
      const data = (await response.json()) as {
        profile?: { userId: string; hasPassword: boolean; isNewUser: boolean };
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "ورود انجام نشد.");

      if (isRecovery) {
        // Recovery path: always let the user set a fresh password after verifying.
        setStep("password-setup");
      } else if (data.profile?.hasPassword || !data.profile?.isNewUser) {
        // Returning user with an existing session path — go straight to dashboard.
        router.push("/dashboard");
      } else {
        // First-time user without a password — offer optional password setup.
        setStep("password-setup");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "ورود انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  };

  const setPasswordOptional = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    setSubmitting(true);
    try {
      if (newPassword.trim()) {
        const response = await fetch("/api/auth/password/set", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ password: newPassword.trim() }),
        });
        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error || "تنظیم رمز انجام نشد.");
        }
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تنظیم رمز انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  };

  const resendCode = async () => {
    await sendOtp(phone);
  };

  const changePhone = () => {
    setStep("phone");
    setOtp("");
    setError("");
    setExpiresAt(null);
    setTimeLeft(0);
    setIsRecovery(false);
  };

  return (
    <div className="w-full">
      {step === "phone" && loginMode === "otp" && (
        <form onSubmit={(e) => void requestOtp(e)} className="flex flex-col gap-5">
          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-bold text-ink">
              شماره تلفن همراه
            </label>
            <div className="relative">
              <Phone
                aria-hidden
                className="pointer-events-none absolute start-4 top-1/2 size-4.5 -translate-y-1/2 text-faint"
              />
              <input
                id="phone"
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                autoComplete="tel"
                aria-invalid={!!error}
                className="w-full rounded-2xl border border-line bg-canvas/60 py-3.5 ps-11 pe-4 text-sm text-ink outline-none transition-all duration-300 placeholder:text-faint focus:border-brand focus:bg-card focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand)_14%,transparent)]"
              />
            </div>
            {error && (
              <p role="alert" className="animate-rise mt-2 text-xs font-semibold text-danger">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-deep px-6 py-4 text-sm font-black text-onbrand shadow-[var(--shadow-brand)] transition-all duration-500 hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:opacity-85"
          >
            {submitting ? (
              <>
                <span className="animate-breathe size-3 rounded-full bg-onbrand" />
                در حال ارسال کد…
              </>
            ) : (
              <>
                <MessageCircle className="size-4.5" />
                دریافت کد ورود
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setError("");
              setLoginMode("password");
            }}
            className="mx-auto inline-flex items-center gap-1.5 text-xs font-bold text-brand-ink underline-offset-4 hover:underline"
          >
            <KeyRound className="size-3.5" />
            به‌جای کد، با رمز عبور وارد شو
          </button>

          <p className="flex items-center gap-2 text-xs font-medium text-soft">
            <Shield className="size-3.5 text-brand" />
            ورود امن بدون نیاز به رمز عبور
          </p>
        </form>
      )}

      {step === "phone" && loginMode === "password" && (
        <form onSubmit={(e) => void loginWithPassword(e)} className="flex flex-col gap-5">
          <button
            type="button"
            onClick={() => {
              setError("");
              setLoginMode("otp");
            }}
            className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-brand-ink underline-offset-4 hover:underline"
          >
            <Undo2 className="size-3.5" />
            بازگشت به ورود با کد پیامکی
          </button>

          <div>
            <label htmlFor="phone-pw" className="mb-2 block text-sm font-bold text-ink">
              شماره تلفن همراه
            </label>
            <div className="relative">
              <Phone
                aria-hidden
                className="pointer-events-none absolute start-4 top-1/2 size-4.5 -translate-y-1/2 text-faint"
              />
              <input
                id="phone-pw"
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                autoComplete="tel"
                className="w-full rounded-2xl border border-line bg-canvas/60 py-3.5 ps-11 pe-4 text-sm text-ink outline-none transition-all duration-300 placeholder:text-faint focus:border-brand focus:bg-card focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand)_14%,transparent)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-bold text-ink">
              رمز عبور
            </label>
            <div className="relative">
              <Lock
                aria-hidden
                className="pointer-events-none absolute start-4 top-1/2 size-4.5 -translate-y-1/2 text-faint"
              />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبورت را وارد کن"
                autoComplete="current-password"
                aria-invalid={!!error}
                className="w-full rounded-2xl border border-line bg-canvas/60 py-3.5 ps-11 pe-4 text-sm text-ink outline-none transition-all duration-300 placeholder:text-faint focus:border-brand focus:bg-card focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand)_14%,transparent)]"
              />
            </div>
            {error && (
              <p role="alert" className="animate-rise mt-2 text-xs font-semibold text-danger">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={() => void forgotPassword()}
              disabled={submitting}
              className="mt-2.5 text-xs font-bold text-clay underline-offset-4 hover:underline disabled:opacity-60"
            >
              رمز عبور را فراموش کرده‌ام
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-deep px-6 py-4 text-sm font-black text-onbrand shadow-[var(--shadow-brand)] transition-all duration-500 hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:opacity-85"
          >
            {submitting ? (
              <>
                <span className="animate-breathe size-3 rounded-full bg-onbrand" />
                در حال ورود…
              </>
            ) : (
              "ورود با رمز عبور"
            )}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={(e) => void verifyOtp(e)} className="flex flex-col gap-5">
          <div className="mb-2">
            {isRecovery && (
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-sand-soft px-3 py-1.5 text-[11px] font-bold text-clay">
                <KeyRound className="size-3.5" />
                بازیابی رمز عبور با کد پیامکی
              </p>
            )}
            <p className="text-sm text-soft">
              کد ۵ رقمی به شماره{" "}
              <span className="font-bold text-ink" dir="ltr">{phone}</span> ارسال شد.
            </p>
            <button
              type="button"
              onClick={changePhone}
              className="mt-1 text-xs font-bold text-brand-ink underline-offset-4 hover:underline"
            >
              تغییر شماره
            </button>
          </div>

          <div>
            <label htmlFor="otp" className="mb-2 block text-sm font-bold text-ink">
              کد تأیید
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="۱۲۳۴۵"
              dir="ltr"
              autoComplete="one-time-code"
              aria-invalid={!!error}
              className="w-full rounded-2xl border border-line bg-canvas/60 py-3.5 px-4 text-center text-lg font-bold tracking-widest text-ink outline-none transition-all duration-300 placeholder:text-faint focus:border-brand focus:bg-card focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand)_14%,transparent)]"
            />
            {error && (
              <p role="alert" className="animate-rise mt-2 text-xs font-semibold text-danger">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-faint">
              {timeLeft > 0 ? `انقضا در ${formatTime(timeLeft)}` : "کد منقضی شده"}
            </span>
            <button
              type="button"
              onClick={() => void resendCode()}
              disabled={submitting || timeLeft > 0}
              className="font-bold text-brand-ink underline-offset-4 hover:underline disabled:opacity-50"
            >
              ارسال دوباره کد
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting || otp.length !== 5}
            className="inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-deep px-6 py-4 text-sm font-black text-onbrand shadow-[var(--shadow-brand)] transition-all duration-500 hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:opacity-85"
          >
            {submitting ? (
              <>
                <span className="animate-breathe size-3 rounded-full bg-onbrand" />
                در حال ورود…
              </>
            ) : (
              "ورود به آراما"
            )}
          </button>
        </form>
      )}

      {step === "password-setup" && (
        <form onSubmit={(e) => void setPasswordOptional(e)} className="flex flex-col gap-5">
          <div>
            <h3 className="text-base font-extrabold text-ink">
              {isRecovery ? "رمز عبور جدید" : "خوش آمدی!"}
            </h3>
            <p className="mt-2 text-sm leading-7 text-soft">
              {isRecovery
                ? "هویتت با کد پیامکی تأیید شد. می‌توانی یک رمز عبور جدید تعیین کنی، یا همچنان فقط با کد پیامکی وارد شوی."
                : "برای ورود سریع‌تر دفعات بعد، می‌توانی یک رمز عبور تعیین کنی. این کار اختیاری است."}
            </p>
          </div>

          <div>
            <label htmlFor="password-setup" className="mb-2 block text-sm font-bold text-ink">
              {isRecovery ? "رمز عبور جدید" : "رمز عبور (اختیاری)"}
            </label>
            <input
              id="password-setup"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="دست‌کم ۸ نویسه"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-line bg-canvas/60 py-3.5 px-4 text-sm text-ink outline-none transition-all duration-300 placeholder:text-faint focus:border-brand focus:bg-card focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand)_14%,transparent)]"
            />
            {error && (
              <p role="alert" className="animate-rise mt-2 text-xs font-semibold text-danger">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-deep px-6 py-4 text-sm font-black text-onbrand shadow-[var(--shadow-brand)] transition-all duration-500 hover:-translate-y-0.5 hover:brightness-110 disabled:translate-y-0 disabled:opacity-85"
          >
            {submitting ? (
              <>
                <span className="animate-breathe size-3 rounded-full bg-onbrand" />
                در حال ذخیره…
              </>
            ) : newPassword.trim() ? (
              "ذخیره رمز و ورود"
            ) : (
              "رد کردن، فقط با کد ورود می‌کنم"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
