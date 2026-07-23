import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ReportsView } from "@/components/reports-view";

export const metadata: Metadata = {
  title: "گزارش روند خلق‌وخو و رشد شخصی",
  description: "تحلیل نموداری و روایت انسانی از روند تغییرات احساسی و قدم‌های کوچک شما در مسیر سلامت روان.",
};

export default function ReportsPage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <header className="mb-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-sand-soft px-3.5 py-1.5 text-[11px] font-black text-clay">
            <BarChart3 className="size-3.5" />
            مسیرت را ببین
          </span>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-ink sm:text-3xl">
            گزارش هفتگی رشد
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-soft">
            نمایی گرم و انسانی از مسیرت؛ نه آمار سرد، بلکه روایتی از تلاش‌های کوچکت.
          </p>
        </header>
        <ReportsView />
      </main>
    </AppShell>
  );
}
