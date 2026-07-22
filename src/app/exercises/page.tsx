import type { Metadata } from "next";
import { Wind } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ExerciseLibrary } from "@/components/exercise-library";

export const metadata: Metadata = { title: "تمرین‌ها" };

export default function ExercisesPage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <header className="relative mb-12 overflow-hidden rounded-[2rem] bg-sand-soft/30 p-8 sm:p-10 border border-sand/20">
          <div className="absolute -top-24 -right-24 -z-10 h-64 w-64 animate-[pulse_6s_ease-in-out_infinite] rounded-full bg-sand/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 -z-10 h-64 w-64 animate-[pulse_8s_ease-in-out_infinite] rounded-full bg-brand/10 blur-3xl" />
          
          <span className="inline-flex items-center gap-2 rounded-full bg-tint-strong px-3.5 py-1.5 text-[11px] font-black text-brand-ink shadow-sm">
            <Wind className="size-3.5" />
            قدم‌های کوچک، اثرهای واقعی
          </span>
          <h1 className="mt-5 text-2xl font-black tracking-tight text-ink sm:text-3xl">
            تمرین‌های آراما
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-8 text-soft">
            تمرینی را انتخاب کن که به حال همین لحظه‌ات نزدیک‌تر است؛ لازم نیست همه‌چیز را یک‌باره حل کنی.
          </p>
        </header>
        <ExerciseLibrary />
      </main>
    </AppShell>
  );
}
