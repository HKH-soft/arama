import type { Metadata } from "next";
import { Wind } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ExerciseLibrary } from "@/components/exercise-library";

export const metadata: Metadata = { title: "تمرین‌ها" };

export default function ExercisesPage() {
  return <AppShell><main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8"><header className="mb-9"><span className="inline-flex items-center gap-2 rounded-full bg-tint-strong px-3.5 py-1.5 text-[11px] font-black text-brand-ink"><Wind className="size-3.5" />قدم‌های کوچک، اثرهای واقعی</span><h1 className="mt-4 text-2xl font-black tracking-tight text-ink sm:text-3xl">تمرین‌های آراما</h1><p className="mt-3 max-w-xl text-sm leading-7 text-soft">تمرینی را انتخاب کن که به حال همین لحظه‌ات نزدیک‌تر است؛ لازم نیست همه‌چیز را یک‌باره حل کنی.</p></header><ExerciseLibrary /></main></AppShell>;
}
