import type { Metadata } from "next";
import { AudioLines, Heart } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MeditationLibrary } from "@/components/meditation-library";

export const metadata: Metadata = { title: "مدیتیشن" };

export default function MeditationPage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-sand-soft px-3.5 py-1.5 text-[11px] font-black text-clay"><Heart className="size-3.5" />برای مکث‌های کوچک</span>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-ink sm:text-3xl">کتابخانهٔ آرامش</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-soft">صداهایی برای وقت‌هایی که می‌خواهی بخوابی، تمرکز کنی، اضطراب را کمی دورتر بگذاری یا فقط یک نفس کامل بکشی.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-card px-4 py-3 text-xs font-bold text-faint"><AudioLines className="size-4 text-brand" />هر صدا با یک کلیک پخش می‌شود</div>
        </header>
        <MeditationLibrary />
      </main>
    </AppShell>
  );
}
