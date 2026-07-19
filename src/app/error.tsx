"use client";

import { useEffect } from "react";
import Link from "next/link";
import { HeartHandshake, RefreshCw } from "lucide-react";
import { Ambient } from "@/components/ambient";
import { AramaMark } from "@/components/logo";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log for observability without exposing details to the user.
    console.error("آراما — خطای بخش برنامه:", error);
  }, [error]);

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-x-clip px-4 py-10">
      <Ambient />

      <div className="card-soft relative w-full max-w-lg rounded-[2rem] p-8 text-center sm:p-12">
        <div className="mx-auto flex justify-center">
          <span className="animate-breathe">
            <AramaMark className="size-16" />
          </span>
        </div>

        <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-tint-strong px-4 py-1.5 text-xs font-bold text-brand-ink">
          <HeartHandshake className="size-3.5" />
          یک خطای موقت
        </span>

        <h1 className="mt-5 text-2xl font-black tracking-tight text-ink sm:text-3xl">
          مشکلی از طرف ما پیش آمد
        </h1>
        <p className="mt-3 text-sm leading-7 text-soft sm:text-base sm:leading-8">
          نگران نباش، این مشکل از سمت توست نیست. می‌توانی دوباره تلاش کنی یا
          چند لحظه بعد برگردی.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-deep px-6 py-3.5 text-sm font-black text-onbrand shadow-[var(--shadow-brand)] transition-all duration-500 hover:-translate-y-0.5 hover:brightness-110 sm:w-auto"
          >
            <RefreshCw className="size-4" />
            تلاش دوباره
          </button>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-card px-6 py-3.5 text-sm font-bold text-ink transition-all duration-500 hover:border-brand/40 hover:bg-tint sm:w-auto"
          >
            بازگشت به خانه
          </Link>
        </div>

        <p className="mt-8 border-t border-line pt-5 text-xs leading-6 text-faint">
          اگر در بحران روانی هستی، لطفاً با اورژانس اجتماعی{" "}
          <strong className="text-ink">۱۲۳</strong> تماس بگیر. تنها نیستی.
        </p>
      </div>
    </main>
  );
}
