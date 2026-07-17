import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SessionHistory } from "@/components/session-history";

export const metadata: Metadata = { title: "تاریخچهٔ گفتگوها" };

export default function SessionManagementPage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <header className="mb-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-tint-strong px-3.5 py-1.5 text-[11px] font-black text-brand-ink">
            <BookOpen className="size-3.5" />
            تاریخچه
          </span>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-ink sm:text-3xl">
            تاریخچهٔ گفتگوها
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-soft">
            همهٔ گفتگوهای گذشته‌ات با آراما. هر کدام را ادامه بده یا پاک کن — داده‌هایت فقط دست توست.
          </p>
        </header>
        <SessionHistory />
      </main>
    </AppShell>
  );
}
