"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Phone, Shield } from "lucide-react";

type Step = "phone" | "otp" | "password-setup";

export function PhoneLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

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

  const requestOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    // Validate phone format
    if (!/^09\d{9}$/.test(phone.trim())) {
      setError("شماره تلفن معتبر نیست. فرمت صحیح: 09xxxxxxxxx");
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = (await response.json()) as { message?: string; error?: string; expiresAt?: string };
      if (!response.ok) throw new Error(data.error || "درخواست کد انجام نشد.");
      
      setStep("otp");
      if (data.expiresAt) {
        setExpiresAt(new Date(data.expiresAt));
        setTimeLeft(Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "درخواست کد انجام نشد.");
    } finally {
      setSubmitting(false);
    }
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
      
      if (data.profile?.hasPassword || !data.profile?.isNewUser) {
        // User has password or is returning - go to dashboard
        router.push("/dashboard");
      } else {
        // First-time user without password - offer optional password setup
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
      if (password.trim()) {
        // User chose to set a password
        const response = await fetch("/api/auth/password/set", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ password: password.trim() }),
        });
        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error || "تنظیم رمز انجام نشد.");
        }
      }
      // Either way, redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تنظیم رمز انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  };

  const resendCode = async () => {
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = (await response.json()) as { error?: string; expiresAt?: string };
      if (!response.ok) throw new Error(data.error || "ارسال کد انجام نشد.");
      setOtp("");
      if (data.expiresAt) {
        setExpiresAt(new Date(data.expiresAt));
        setTimeLeft(Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال کد انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  };

  const changePhone = () => {
    setStep("phone");
    setOtp("");
    setError("");
    setExpiresAt(null);
    setTimeLeft(0);
  };

  return (
    <div className="w-full">
      {step === "phone" && (
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

          <p className="flex items-center gap-2 text-xs font-medium text-soft">
            <Shield className="size-3.5 text-brand" />
            ورود امن بدون نیاز به رمز عبور
          </p>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={(e) => void verifyOtp(e)} className="flex flex-col gap-5">
          <div className="mb-2">
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
            <h3 className="text-base font-extrabold text-ink">خوش آمدی!</h3>
            <p className="mt-2 text-sm leading-7 text-soft">
              برای ورود سریع‌تر دفعات بعد، می‌توانی یک رمز عبور تعیین کنی. این کار اختیاری است.
            </p>
          </div>

          <div>
            <label htmlFor="password-setup" className="mb-2 block text-sm font-bold text-ink">
              رمز عبور (اختیاری)
            </label>
            <input
              id="password-setup"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            ) : password.trim() ? (
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
