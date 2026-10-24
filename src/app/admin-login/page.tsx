"use client";

import { useState } from "react";
import { KeyRound, Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(
          payload.error ||
            (response.status === 401 ? "رمز عبور مدیریت نادرست است." : "خطا در ارتباط با سرور.")
        );
      }

      window.location.href = "/admin";
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "ورود ناموفق بود.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="grid min-h-screen place-items-center bg-[#0d1117] px-4 relative overflow-hidden font-sans text-slate-100"
      dir="rtl"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-deep/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#161b26]/90 backdrop-blur-2xl p-8 text-white shadow-2xl relative z-10">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <span className="rounded-full px-3 py-1 text-[11px] font-mono font-bold bg-brand/10 text-brand border border-brand/30 flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            ADMIN CONSOLE
          </span>
        </div>

        <h1 className="mt-6 text-xl font-black text-white">مرکز فرماندهی آراما</h1>
        <p className="mt-2 text-xs leading-6 text-slate-400">
          ورود اختصاصی مدیر سیستم؛ دسترسی به آمار کاربران، وضعیت اشتراک‌ها، تراکنش‌های مالی و سلامت پلتفرم.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="relative block">
            <span className="sr-only">رمز عبور مدیریت</span>
            <KeyRound className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور مدیریت سیستم"
              className="h-12 w-full rounded-2xl border border-white/10 bg-[#1f2636] pr-10 pl-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
              autoFocus
            />
          </label>

          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-3.5 py-2.5 text-xs font-bold text-rose-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-deep text-xs font-black text-onbrand transition hover:brightness-110 shadow-lg shadow-brand-deep/20 disabled:opacity-60 cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {loading ? "در حال اعتبارسنجی..." : "ورود به مرکز فرماندهی"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
          <p className="text-[10px] font-mono text-slate-500">
            ARAMA INTELLIGENCE PLATFORM · V3.0
          </p>
        </div>
      </div>
    </main>
  );
}
