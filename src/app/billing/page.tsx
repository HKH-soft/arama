import type { Metadata } from "next";
import { CreditCard } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { BillingView } from "@/components/billing-view";

export const metadata: Metadata = {
  title: "اشتراک و صورتحساب",
  description: "مدیریت طرح‌های اشتراک آراما پریمیوم، صورتحساب و پرداخت امن از طریق درگاه زرین‌پال.",
};

export default function BillingPage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <header className="mb-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-sand-soft px-3.5 py-1.5 text-[11px] font-black text-clay">
            <CreditCard className="size-3.5" />
            مدیریت اشتراک
          </span>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-ink sm:text-3xl">
            اشتراک و صورتحساب
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-soft">
            وضعیت اشتراکت، امکاناتی که داری و مدیریت پرداخت — همه‌چیز زیر کنترل توست.
          </p>
        </header>
        <BillingView />
      </main>
    </AppShell>
  );
}
