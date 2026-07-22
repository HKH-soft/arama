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
  originalPrice?: number;
  dailyEquivalentNote?: string;
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
        <SectionHeading
          eyebrow="تعرفه‌ها"
          title="طرح‌های متناسب با نیاز شما"
          description="با نسخهٔ رایگان شروع کن؛ هر وقت آماده بودی، بدون هیچ فشاری ارتقا بده. همیشه می‌توانی لغو کنی."
        />
        <div className="mt-20" aria-live="polite">
          {loading && <div className="grid gap-6 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="card-soft h-[430px] rounded-[2rem] p-8"><div className="calm-skeleton h-5 w-32 rounded-full" /><div className="calm-skeleton mt-4 h-12 w-full rounded-2xl" /><div className="calm-skeleton mt-6 h-10 w-36 rounded-full" /><div className="mt-8 space-y-4">{[0, 1, 2, 3, 4].map((j) => <div key={j} className="calm-skeleton h-4 w-full rounded-full" />)}</div></div>)}</div>}
          {!loading && error && <div className="card-soft rounded-[2rem] p-12 text-center"><WifiOff className="mx-auto size-8 text-danger" /><p className="mt-4 text-sm font-bold text-ink">{error}</p><button type="button" onClick={() => void load()} className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-deep px-5 py-2.5 text-xs font-bold text-onbrand"><RefreshCw className="size-3.5" />تلاش دوباره</button></div>}
          {!loading && !error && plans.length === 0 && <div className="card-soft rounded-[2rem] p-12 text-center"><p className="text-sm font-bold text-ink">فعلاً طرحی برای نمایش نداریم.</p></div>}
          {!loading && !error && plans.length > 0 && (
            <div className="grid items-stretch gap-6 lg:grid-cols-3">
              {plans.map((plan, i) => (
                <Reveal key={plan.id} delay={i * 130} className="h-full">
                  <article className={`relative flex h-full flex-col overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
                    plan.featured 
                      ? "bg-brand-deep text-onbrand shadow-xl shadow-brand-deep/30 ring-1 ring-brand/50 lg:-my-4 lg:py-12" 
                      : "bg-card/80 backdrop-blur-md border border-line shadow-lg"
                  }`}>
                    {plan.featured && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                    )}
                    {plan.featured && (
                      <span className="absolute top-6 left-6 inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 text-[10px] font-bold text-white shadow-sm border border-white/20">
                        <Sparkles className="size-3" /> پیشنهاد ویژه
                      </span>
                    )}
                    <h3 className={`text-xl font-black tracking-tight ${plan.featured ? "text-white" : "text-ink"}`}>
                      {plan.name}
                    </h3>
                    <p className={`mt-3 min-h-[3rem] text-sm leading-6 ${plan.featured ? "text-white/80" : "text-soft"}`}>
                      {plan.description}
                    </p>
                    <div className="mt-8 flex flex-col gap-1">
                      {plan.originalPrice && plan.originalPrice > plan.price && (
                        <span className={`text-sm font-bold line-through ${plan.featured ? "text-white/60" : "text-faint"}`}>
                          {formatPrice(plan.originalPrice)}
                        </span>
                      )}
                      <div className="flex items-end gap-1.5">
                        <span className={`text-5xl font-black tracking-tight ${plan.featured ? "text-white" : "text-ink"}`}>
                          {formatPrice(plan.price)}
                        </span>
                        {plan.price > 0 && (
                          <span className={`pb-2 text-xs font-bold ${plan.featured ? "text-white/70" : "text-faint"}`}>
                            تومان
                          </span>
                        )}
                      </div>
                      {plan.dailyEquivalentNote && (
                        <span className={`mt-1.5 text-xs font-bold ${plan.featured ? "text-white/90 bg-white/10 px-2.5 py-1 rounded-md w-fit" : "text-brand-deep bg-brand/10 px-2.5 py-1 rounded-md w-fit"}`}>
                          {plan.dailyEquivalentNote}
                        </span>
                      )}
                    </div>
                    <ul className={`mt-8 flex flex-col gap-3.5 border-t pt-8 flex-grow ${plan.featured ? "border-white/10" : "border-line"}`}>
                      {plan.features.map((feature) => (
                        <li key={feature} className={`flex items-start gap-3 text-sm leading-6 ${plan.featured ? "text-white/90" : "text-soft"}`}>
                          <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${plan.featured ? "bg-white/20 text-white" : "bg-brand/10 text-brand-deep"}`}>
                            <Check className="size-3" strokeWidth={3} />
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href="/login" className={`mt-10 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black transition-transform hover:scale-[1.02] ${
                      plan.featured 
                        ? "bg-white text-brand-deep shadow-lg" 
                        : "bg-brand-deep text-onbrand shadow-md"
                    }`}>
                      {plan.cta}
                    </Link>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
        <Reveal delay={220}><p className="mt-14 flex flex-wrap items-center justify-center gap-2 text-center text-sm font-bold text-soft"><HeartHandshake className="size-5 text-brand" />۷ روز ضمانت بازگشت وجه · لغو در هر لحظه، بدون سؤال و بدون قفل‌شدن داده‌ها</p></Reveal>
      </div>
    </section>
  );
}
