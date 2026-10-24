"use client";

import { useEffect } from "react";
import { Heart, Phone, ShieldAlert, X } from "lucide-react";

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-card p-6 shadow-2xl transition-all sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Heart className="size-6 fill-current animate-pulse" />
            </span>
            <div>
              <h2 id="crisis-title" className="text-lg font-bold text-ink sm:text-xl">
                تنها نیستی؛ کمک فوری همیشه در دسترس است
              </h2>
              <p className="mt-0.5 text-xs text-soft sm:text-sm">
                خطوط تماس رایگان و محرمانه ۲۴ ساعته متخصصان در ایران
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="grid size-9 place-items-center rounded-full border border-line bg-background text-soft hover:bg-tint hover:text-ink transition-colors"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Empathy Note */}
        <div className="mt-5 rounded-2xl border border-rose-200/50 bg-rose-50/50 p-4 text-xs leading-relaxed text-rose-950 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-200 sm:text-sm">
          اگر در این لحظه احساس فشار روانی شدید، بی‌پناهی یا افکار آسیب‌رسان داری، لطفاً با یکی از این شماره‌ها تماس بگیر. افراد متخصصی هستند که بدون قضاوت و صبورانه آماده شنیدن حرف‌های تو هستند.
        </div>

        {/* Helpline cards */}
        <div className="mt-5 space-y-3">
          <a
            href="tel:123"
            className="group flex items-center justify-between rounded-2xl border border-line bg-background p-4 transition-all hover:border-brand/40 hover:bg-tint hover:shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-deep text-onbrand transition-transform group-hover:scale-105">
                <Phone className="size-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-ink sm:text-base">اورژانس اجتماعی (سازمان بهزیستی)</p>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    ۲۴ ساعته
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-soft">پشتیبانی فوری بحران‌های روحی و خانوادگی</p>
              </div>
            </div>
            <span className="text-lg font-black text-brand-ink dir-ltr">۱۲۳</span>
          </a>

          <a
            href="tel:1480"
            className="group flex items-center justify-between rounded-2xl border border-line bg-background p-4 transition-all hover:border-brand/40 hover:bg-tint hover:shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <span className="grid size-11 place-items-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 transition-transform group-hover:scale-105">
                <Phone className="size-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-ink sm:text-base">صدای مشاور بهزیستی</p>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                    رایگان
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-soft">مشاوره تخصصی روان‌شناختی (۸ صبح تا ۲۴)</p>
              </div>
            </div>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 dir-ltr">۱۴۸۰</span>
          </a>

          <a
            href="tel:115"
            className="group flex items-center justify-between rounded-2xl border border-line bg-background p-4 transition-all hover:border-brand/40 hover:bg-tint hover:shadow-md"
          >
            <div className="flex items-center gap-3.5">
              <span className="grid size-11 place-items-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 transition-transform group-hover:scale-105">
                <ShieldAlert className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink sm:text-base">اورژانس پیش‌بیمارستانی کشور</p>
                <p className="mt-0.5 text-xs text-soft">برای فوریت‌های فیزیکی و مسمومیت‌ها</p>
              </div>
            </div>
            <span className="text-lg font-black text-red-600 dark:text-red-400 dir-ltr">۱۱۵</span>
          </a>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between pt-2">
          <p className="text-[11px] text-faint">تماس با این شماره‌ها کاملاً رایگان است و نیازی به پیش‌شماره ندارد.</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-tint px-4 py-2 text-xs font-bold text-ink hover:bg-brand/10 transition-colors"
          >
            متشکرم
          </button>
        </div>
      </div>
    </div>
  );
}
