import Link from "next/link";
import { Compass, LayoutDashboard } from "lucide-react";
import { Ambient } from "@/components/ambient";
import { AramaMark } from "@/components/logo";

export const metadata = {
  title: "صفحه پیدا نشد",
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-x-clip px-4 py-10">
      <Ambient variant="warm" />

      <div className="card-soft relative w-full max-w-lg rounded-[2rem] p-8 text-center sm:p-12">
        <div className="mx-auto flex justify-center">
          <span className="animate-breathe">
            <AramaMark className="size-16" />
          </span>
        </div>

        <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-sand-soft px-4 py-1.5 text-xs font-bold text-clay">
          <Compass className="size-3.5" />
          خطای ۴۰۴
        </span>

        <h1 className="mt-5 text-2xl font-black tracking-tight text-ink sm:text-3xl">
          این مسیر را پیدا نکردیم
        </h1>
        <p className="mt-3 text-sm leading-7 text-soft sm:text-base sm:leading-8">
          شاید نشانی اشتباه بود یا این صفحه جابه‌جا شده. نگران نباش؛ راه برگشت
          همیشه باز است.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-deep px-6 py-3.5 text-sm font-black text-onbrand shadow-[var(--shadow-brand)] transition-all duration-500 hover:-translate-y-0.5 hover:brightness-110 sm:w-auto"
          >
            بازگشت به خانه
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-card px-6 py-3.5 text-sm font-bold text-ink transition-all duration-500 hover:border-brand/40 hover:bg-tint sm:w-auto"
          >
            <LayoutDashboard className="size-4" />
            رفتن به داشبورد
          </Link>
        </div>
      </div>
    </main>
  );
}
