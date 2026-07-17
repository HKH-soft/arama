import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SettingsView } from "@/components/settings-view";

export const metadata: Metadata = { title: "تنظیمات" };

export default function SettingsPage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <header className="mb-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-tint-strong px-3.5 py-1.5 text-[11px] font-black text-brand-ink">
            <Settings className="size-3.5" />
            تنظیمات
          </span>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-ink sm:text-3xl">
            تنظیمات
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-soft">
            یادآورها، حالت نمایش و مدیریت داده‌هایت.
          </p>
        </header>
        <SettingsView />
      </main>
    </AppShell>
  );
}
