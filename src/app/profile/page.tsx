import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProfileView } from "@/components/profile-view";

export const metadata: Metadata = { title: "پروفایل" };

export default function ProfilePage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <header className="mb-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-tint-strong px-3.5 py-1.5 text-[11px] font-black text-brand-ink">
            <UserRound className="size-3.5" />
            حساب من
          </span>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-ink sm:text-3xl">
            پروفایل
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-soft">
            اطلاعات حساب و تنظیمات شخصی‌ات را مدیریت کن.
          </p>
        </header>
        <ProfileView />
      </main>
    </AppShell>
  );
}
