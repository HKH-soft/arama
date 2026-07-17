"use client";

import { useEffect, useState } from "react";
import { Check, HeartHandshake, RefreshCw, Sparkles, WifiOff } from "lucide-react";
import Link from "next/link";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

type Plan = {
  id: string;
  name: string;
  price: number;
  unit: string;
  period: string;
  description: string;
  cta: string;
  featured: boolean;
  features: string[];
};

const formatPrice = (price: number) => price === 0 ? "رایگان" : price.toLocaleString("fa-IR");

export function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/plans", { cache: "no-store" });
      const data = (await response.json()) as { plans?: Plan[]; error?: string };
      if (!response.ok) throw new Error(data.error || "تعرفه‌ها بارگذاری نشدند.");
      setPlans(data.plans ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعرفه‌ها بارگذاری نشدند.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  return (
    <section id="pricing" className="relative scroll-mt-28 overflow-hidden bg-canvas-warm/60 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="تعرفه‌ها" title="آرامش، نباید لوکس باشد" description="با نسخهٔ رایگان شروع کن؛ هر وقت آماده بودی، بدون هیچ فشاری ارتقا بده. همیشه می‌توانی لغو کنی." />
        <div className="mt-16" aria-live="polite">
          {loading && <div className="grid gap-6 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="card-soft h-[430px] rounded-[2rem] p-8"><div className="calm-skeleton h-5 w-32 rounded-full" /><div className="calm-skeleton mt-4 h-12 w-full rounded-2xl" /><div className="calm-skeleton mt-6 h-10 w-36 rounded-full" /><div className="mt-8 space-y-4">{[0, 1, 2, 3, 4].map((j) => <div key={j} className="calm-skeleton h-4 w-full rounded-full" />)}</div></div>)}</div>}
          {!loading && error && <div className="card-soft rounded-[2rem] p-12 text-center"><WifiOff className="mx-auto size-8 text-danger" /><p className="mt-4 text-sm font-bold text-ink">{error}</p><button type="button" onClick={() => void load()} className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-deep px-5 py-2.5 text-xs font-bold text-onbrand"><RefreshCw className="size-3.5" />تلاش دوباره</button></div>}
          {!loading && !error && plans.length === 0 && <div className="card-soft rounded-[2rem] p-12 text-center"><p className="text-sm font-bold text-ink">فعلاً طرحی برای نمایش نداریم.</p></div>}
          {!loading && !error && plans.length > 0 && <div className="grid items-stretch gap-6 lg:grid-cols-3">{plans.map((plan, i) => <Reveal key={plan.id} delay={i * 130} className="h-full"><article className={`relative flex h-full flex-col rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-1.5 ${plan.featured ? "border border-brand/30 bg-card shadow-[var(--shadow-lift)] lg:-my-4 lg:py-12" : "card-soft"}`}>{plan.featured && <span className="absolute -top-4 start-8 inline-flex items-center gap-1.5 rounded-full bg-brand-deep px-4 py-1.5 text-xs font-bold text-onbrand shadow-[var(--shadow-brand)]"><Sparkles className="size-3.5" />محبوب‌ترین انتخاب</span>}<h3 className="text-lg font-extrabold text-ink">{plan.name}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-soft">{plan.description}</p><div className="mt-6 flex items-end gap-2"><span className={`text-4xl font-black tracking-tight ${plan.price === 0 ? "text-brand-ink" : "text-ink"}`}>{formatPrice(plan.price)}</span>{plan.price > 0 && <span className="pb-1.5 text-xs font-semibold text-faint">{plan.unit}</span>}</div><p className="mt-1.5 text-[11px] font-medium text-clay">{plan.period}</p><ul className="mt-7 flex flex-col gap-3 border-t border-line pt-7">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-2.5 text-sm leading-6 text-soft"><span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${plan.featured ? "bg-brand-deep text-onbrand" : "bg-tint-strong text-brand-ink"}`}><Check className="size-3" strokeWidth={3} /></span>{feature}</li>)}</ul><Link href="/signup" className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-all duration-500 ${plan.featured ? "bg-brand-deep text-onbrand shadow-[var(--shadow-brand)] hover:-translate-y-0.5 hover:brightness-110" : "border border-line-strong bg-card text-ink hover:border-brand/40 hover:bg-tint"}`}>{plan.cta}</Link></article></Reveal>)}</div>}
        </div>
        <Reveal delay={220}><p className="mt-12 flex flex-wrap items-center justify-center gap-2 text-center text-xs font-medium text-faint"><HeartHandshake className="size-4 text-clay" />۷ روز ضمانت بازگشت وجه · لغو در هر لحظه، بدون سؤال و بدون قفل‌شدن داده‌ها</p></Reveal>
      </div>
    </section>
  );
}
