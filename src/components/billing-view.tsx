"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  CheckCircle,
  CreditCard,
  History,
  RefreshCw,
  Shield,
  Sparkles,
  WifiOff,
} from "lucide-react";

type Sub = {
  subscription: {
    id: string;
    status: string;
    amount: number;
    interval: string;
    startedAt: string;
    renewsAt: string;
  };
  plan: {
    id: string;
    name: string;
    price: number;
    unit: string;
    period: string;
    description: string;
    features: string[];
    featured: boolean;
  };
};

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

type PaymentRow = {
  id: string;
  amount: number;
  refId: string | null;
  status: string;
  createdAt: string;
  planId: string;
};

function BillingViewInner() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const trackingCode = searchParams.get("ref");

  const [sub, setSub] = useState<Sub | null>(null);
  const isActive = sub?.subscription.status === "active";
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentsList, setPaymentsList] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canceling, setCanceling] = useState(false);
  const [upgradingPlanId, setUpgradingPlanId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [subRes, plansRes] = await Promise.all([
        fetch("/api/subscription", { cache: "no-store" }),
        fetch("/api/plans", { cache: "no-store" }),
      ]);
      const subData = (await subRes.json()) as {
        subscription?: Sub;
        payments?: PaymentRow[];
        error?: string;
      };
      const plansData = (await plansRes.json()) as { plans?: Plan[]; error?: string };

      if (!subRes.ok) throw new Error(subData.error || "بارگذاری نشد.");
      if (!plansRes.ok) throw new Error(plansData.error || "بارگذاری نشد.");

      setSub(subData.subscription ?? null);
      setPaymentsList(subData.payments ?? []);
      setPlans(plansData.plans ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "اطلاعات اشتراک بارگذاری نشد.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cancel = async () => {
    if (
      !confirm(
        "اشتراکت لغو می‌شود. تا پایان دورهٔ فعلی، همهٔ امکانات فعال می‌ماند. مطمئنی؟"
      )
    )
      return;
    setCanceling(true);
    setActionError("");
    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (!response.ok) throw new Error("لغو اشتراک انجام نشد.");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "لغو اشتراک انجام نشد.");
    } finally {
      setCanceling(false);
    }
  };

  const startCheckout = async (planId: string) => {
    setUpgradingPlanId(planId);
    setActionError("");
    try {
      const response = await fetch("/api/payment/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "شروع فرآیند پرداخت ناموفق بود.");

      if (data.url) {
        // Full page redirect to ZarinPal checkout page
        window.location.href = data.url;
      } else {
        throw new Error("آدرس درگاه پرداخت یافت نشد.");
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "شروع فرآیند پرداخت ناموفق بود.");
      setUpgradingPlanId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card-soft rounded-[1.75rem] p-7">
          <div className="calm-skeleton h-6 w-40 rounded-full" />
          <div className="calm-skeleton mt-5 h-16 w-full rounded-2xl" />
          <div className="calm-skeleton mt-5 h-4 w-60 rounded-full" />
          <div className="calm-skeleton mt-3 h-4 w-44 rounded-full" />
        </div>
        <div className="card-soft rounded-[1.75rem] p-7">
          <div className="calm-skeleton h-5 w-32 rounded-full" />
          <div className="calm-skeleton mt-6 h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-soft rounded-[1.75rem] p-12 text-center">
        <WifiOff className="mx-auto size-8 text-danger" />
        <p className="mt-4 text-sm font-bold text-ink">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-deep px-5 py-2.5 text-xs font-bold text-onbrand"
        >
          <RefreshCw className="size-3.5" />
          تلاش دوباره
        </button>
      </div>
    );
  }

  const showBanners = () => {
    if (paymentStatus === "success") {
      return (
        <div className="mb-6 flex items-start gap-4 rounded-3xl border border-brand/30 bg-tint/80 p-5 text-start animate-rise">
          <CheckCircle className="size-6 shrink-0 text-brand-deep" />
          <div>
            <h3 className="text-sm font-extrabold text-brand-ink">پرداخت با موفقیت انجام شد</h3>
            <p className="mt-1 text-xs leading-6 text-soft">
              اشتراک شما فعال گردید و اکنون به تمام امکانات دسترسی کامل دارید.
            </p>
            {trackingCode && (
              <p className="mt-2 text-xs font-black text-ink">
                کد پیگیری زرین‌پال: <span className="font-sans text-[13px] tracking-wider select-all bg-card/60 px-2 py-0.5 rounded-lg border border-line">{trackingCode}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    if (paymentStatus === "failed") {
      return (
        <div className="mb-6 flex items-start gap-4 rounded-3xl border border-danger/30 bg-danger/5 p-5 text-start animate-rise">
          <AlertCircle className="size-6 shrink-0 text-danger" />
          <div>
            <h3 className="text-sm font-extrabold text-danger">عملیات پرداخت ناموفق بود</h3>
            <p className="mt-1 text-xs leading-6 text-soft">
              پرداخت شما توسط درگاه تایید نشد یا فرآیند توسط کاربر لغو گردید. لطفاً مجدداً تلاش کنید.
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getPlanName = (pId: string) => {
    return plans.find((p) => p.id === pId)?.name || pId;
  };

  return (
    <div className="space-y-6">
      {showBanners()}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Main section */}
        <div className="space-y-6">
          {!sub ? (
            <div className="card-soft rounded-[1.75rem] p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-deep/5 via-transparent to-brand/5"></div>
              <CreditCard className="relative mx-auto size-10 text-brand opacity-80" />
              <h2 className="relative mt-5 text-xl font-black text-ink">ارتقا به آراما پریمیوم</h2>
              <p className="relative mt-3 text-sm leading-8 text-soft max-w-sm mx-auto">
                با تهیه اشتراک، قفل تمام مدیتیشن‌ها، تمرین‌های تخصصی و گفتگوی نامحدود با دستیار هوشمند را باز کنید.
              </p>
              {plans.length > 0 && (
                <div className="relative mx-auto mt-10 grid max-w-2xl gap-5 sm:grid-cols-2">
                  {plans
                    .filter((p) => p.id !== "free")
                    .map((plan) => {
                      const isUpgrading = upgradingPlanId === plan.id;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => void startCheckout(plan.id)}
                          disabled={upgradingPlanId !== null}
                          className={`relative group rounded-[2rem] p-7 text-start transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl disabled:opacity-60 overflow-hidden ${
                            plan.featured
                              ? "bg-brand-deep text-onbrand shadow-xl shadow-brand-deep/30 ring-1 ring-brand/50"
                              : "bg-card/80 backdrop-blur-md border border-line shadow-lg"
                          }`}
                        >
                          {plan.featured && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                          )}
                          {plan.featured && (
                            <span className="absolute top-5 left-5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold text-white shadow-sm border border-white/20 flex items-center gap-1">
                              <Sparkles className="size-3" /> پیشنهاد ویژه
                            </span>
                          )}
                          <h3 className={`text-lg font-black ${plan.featured ? "text-white" : "text-ink"}`}>{plan.name}</h3>
                          <p className={`mt-2 text-xs leading-6 ${plan.featured ? "text-white/80" : "text-soft"}`}>{plan.description}</p>
                          <div className="mt-6 flex flex-col gap-1">
                            {plan.originalPrice && plan.originalPrice > plan.price && (
                              <span className={`text-sm font-bold line-through ${plan.featured ? "text-white/60" : "text-faint"}`}>
                                {plan.originalPrice.toLocaleString("fa-IR")}
                              </span>
                            )}
                            <div className="flex items-end gap-1">
                              <span className={`text-3xl font-black ${plan.featured ? "text-white" : "text-ink"}`}>
                                {plan.price.toLocaleString("fa-IR")}
                              </span>
                              <span className={`pb-1 text-[11px] font-bold ${plan.featured ? "text-white/70" : "text-faint"}`}>
                                تومان
                              </span>
                            </div>
                            {plan.dailyEquivalentNote && (
                              <span className={`mt-1.5 text-xs font-bold ${plan.featured ? "text-white/90 bg-white/10 px-2.5 py-1 rounded-md w-fit" : "text-brand-deep bg-brand/10 px-2.5 py-1 rounded-md w-fit"}`}>
                                {plan.dailyEquivalentNote}
                              </span>
                            )}
                          </div>
                          
                          <div className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition-transform group-hover:scale-[1.02] ${
                            plan.featured 
                              ? "bg-white text-brand-deep shadow-md" 
                              : "bg-brand-deep text-onbrand"
                          }`}>
                            {isUpgrading ? (
                              <><RefreshCw className="size-4 animate-spin" /> انتقال به درگاه...</>
                            ) : (
                              "خرید اشتراک امن"
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}
              {actionError && (
                <p role="alert" className="relative mt-6 rounded-xl bg-danger/10 px-4 py-3 text-xs font-bold text-danger max-w-sm mx-auto border border-danger/20">
                  {actionError}
                </p>
              )}
            </div>
          ) : (
            <div className="card-soft rounded-[1.75rem] p-7">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand-deep text-onbrand">
                    <Sparkles className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-extrabold text-ink">{sub.plan.name}</h2>
                    <p className="text-xs font-medium text-faint">{sub.plan.description}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1.5 text-[11px] font-black ${
                    sub.subscription.status === "active"
                      ? "bg-tint-strong text-brand-ink"
                      : "bg-sand-soft text-clay"
                  }`}
                >
                  {sub.subscription.status === "active" ? "فعال" : "لغو‌شده"}
                </span>
              </div>
              <div className="mt-6 flex items-end gap-2">
                <span className="text-4xl font-black tracking-tight text-ink">
                  {sub.plan.price > 0 ? sub.plan.price.toLocaleString("fa-IR") : "رایگان"}
                </span>
                {sub.plan.price > 0 && (
                  <span className="pb-1.5 text-xs font-semibold text-faint">
                    {sub.plan.unit}
                  </span>
                )}
              </div>
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t border-line pt-5 text-xs font-semibold text-soft">
                <span>شروع: {new Date(sub.subscription.startedAt).toLocaleDateString("fa-IR")}</span>
                <span>
                  {sub.subscription.status === "active"
                    ? `تمدید خودکار: ${new Date(sub.subscription.renewsAt).toLocaleDateString("fa-IR")}`
                    : `فعال تا: ${new Date(sub.subscription.renewsAt).toLocaleDateString("fa-IR")}`}
                </span>
              </div>
              <ul className="mt-6 flex flex-col gap-2.5">
                {sub.plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm leading-6 text-soft"
                  >
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-tint-strong text-brand-ink">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              {sub.subscription.status === "active" && (
                <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-line pt-6">
                  {plans.filter((p) => p.id !== sub.plan.id && p.id !== "free").length >
                    0 && (
                    <button
                      type="button"
                      onClick={() => setShowUpgrade((v) => !v)}
                      className="rounded-full bg-brand-deep px-5 py-3 text-sm font-bold text-onbrand shadow-[var(--shadow-brand)] transition-all hover:-translate-y-0.5 hover:brightness-110"
                    >
                      تغییر یا ارتقای اشتراک
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void cancel()}
                    disabled={canceling}
                    className="rounded-full border border-line px-5 py-3 text-sm font-bold text-soft transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-50"
                  >
                    {canceling ? "در حال لغو…" : "لغو اشتراک"}
                  </button>
                </div>
              )}
              {!isActive && (
                <div className="mt-7 flex flex-wrap gap-3 border-t border-line pt-6">
                  {plans
                    .filter((p) => p.id !== "free")
                    .map((p) => {
                      const isUpgrading = upgradingPlanId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => void startCheckout(p.id)}
                          disabled={upgradingPlanId !== null}
                          className="rounded-full bg-brand-deep px-5 py-3 text-sm font-bold text-onbrand shadow-[var(--shadow-brand)] disabled:opacity-60"
                        >
                          {isUpgrading ? (
                            <span className="flex items-center gap-1">
                              <RefreshCw className="size-3 animate-spin" /> در حال اتصال…
                            </span>
                          ) : (
                            `فعال‌سازی دوباره ${p.name}`
                          )}
                        </button>
                      );
                    })}
                </div>
              )}
              {showUpgrade && (
                <div className="mt-5 border-t border-line pt-5 animate-rise">
                  <h4 className="text-xs font-extrabold text-ink">انتخاب طرح جدید</h4>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {plans
                      .filter((p) => p.id !== sub.plan.id && p.id !== "free")
                      .map((p) => {
                        const isUpgrading = upgradingPlanId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => void startCheckout(p.id)}
                            disabled={upgradingPlanId !== null}
                            className="rounded-full border border-brand/30 bg-card px-4 py-2 text-xs font-bold text-brand-ink transition-all hover:bg-tint-strong disabled:opacity-50"
                          >
                            {isUpgrading ? (
                              "در حال اتصال…"
                            ) : (
                              `${p.name} — ${p.price.toLocaleString("fa-IR")} ${p.unit}`
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
              {actionError && (
                <p role="alert" className="mt-4 text-xs font-semibold text-danger">
                  {actionError}
                </p>
              )}
            </div>
          )}

          {/* Payment History List */}
          <div className="card-soft rounded-[1.75rem] p-7">
            <h3 className="text-base font-extrabold text-ink flex items-center gap-2">
              <History className="size-5 text-brand" />
              سابقه تراکنش‌ها
            </h3>
            {paymentsList.length === 0 ? (
              <p className="mt-4 text-xs text-soft">هنوز هیچ تراکنشی ثبت نشده است.</p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-start text-xs border-collapse">
                    <thead>
                      <tr className="bg-canvas text-soft border-b border-line text-right">
                        <th className="p-3.5 font-bold">طرح</th>
                        <th className="p-3.5 font-bold">مبلغ (تومان)</th>
                        <th className="p-3.5 font-bold">تاریخ</th>
                        <th className="p-3.5 font-bold">وضعیت</th>
                        <th className="p-3.5 font-bold">کد پیگیری</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentsList.map((pay) => (
                        <tr key={pay.id} className="border-b border-line hover:bg-canvas/30">
                          <td className="p-3.5 font-black text-ink">{getPlanName(pay.planId)}</td>
                          <td className="p-3.5 font-sans tracking-wide text-soft">{pay.amount.toLocaleString("fa-IR")}</td>
                          <td className="p-3.5 text-faint">
                            {new Date(pay.createdAt).toLocaleDateString("fa-IR")}
                          </td>
                          <td className="p-3.5">
                            {pay.status === "paid" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-tint text-brand-ink px-2.5 py-1 font-bold text-[10px]">
                                <Check className="size-3" /> پرداخت شده
                              </span>
                            )}
                            {pay.status === "pending" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-sand-soft text-clay px-2.5 py-1 font-bold text-[10px]">
                                در انتظار
                              </span>
                            )}
                            {pay.status === "failed" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 text-danger px-2.5 py-1 font-bold text-[10px]">
                                ناموفق
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 font-sans tracking-wide text-faint break-all select-all">
                            {pay.refId || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar section */}
        <div className="space-y-5 h-fit">
          <div className="card-soft rounded-[1.75rem] p-7">
            <Shield className="size-7 text-brand" />
            <h3 className="mt-4 text-base font-extrabold text-ink">حریم مالی تو امن است</h3>
            <p className="mt-3 text-sm leading-7 text-soft">
              پرداخت از درگاه امن زرین‌پال انجام می‌شود. اطلاعات کارت تو نزد آراما ذخیره نمی‌شود.
            </p>
          </div>
          <div className="card-soft rounded-[1.75rem] p-7">
            <h3 className="text-sm font-extrabold text-ink">۷ روز ضمانت بازگشت وجه</h3>
            <p className="mt-2 text-xs leading-6 text-soft">
              اگر در هفتهٔ اول احساس کردی آراما مناسبت نیست، تمام مبلغ برگردانده می‌شود.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BillingView() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card-soft rounded-[1.75rem] p-7">
            <div className="calm-skeleton h-6 w-40 rounded-full" />
            <div className="calm-skeleton mt-5 h-16 w-full rounded-2xl" />
          </div>
          <div className="card-soft rounded-[1.75rem] p-7">
            <div className="calm-skeleton h-5 w-32 rounded-full" />
          </div>
        </div>
      }
    >
      <BillingViewInner />
    </Suspense>
  );
}
