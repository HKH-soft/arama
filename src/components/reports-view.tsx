"use client";

import { useEffect, useState } from "react";
import { BarChart3, CheckCircle2, Flame, RefreshCw, Sparkles, TrendingUp, WifiOff } from "lucide-react";
import { MoodChart, type MoodChartPoint } from "./mood-chart";

type Report = {
  checkIns: number;
  average: number;
  best: number;
  latestLabel: string | null;
  trend: number;
  entries: Array<{ mood: number; label: string; checkedInAt: string }>;
  exercisesCompleted: number;
  exercisesThisWeek: number;
  exerciseStreak: number;
  aiInsight?: string;
};

export function ReportsView() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true); setError("");
    try { const response = await fetch("/api/reports", { cache: "no-store" }); const data = (await response.json()) as { report?: Report; error?: string }; if (!response.ok) throw new Error(data.error || "گزارش بارگذاری نشد."); setReport(data.report ?? null); }
    catch (err) { setError(err instanceof Error ? err.message : "گزارش بارگذاری نشد."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  if (loading) return <div className="grid gap-6 lg:grid-cols-3"><div className="card-soft h-80 rounded-[1.75rem] p-7 lg:col-span-2"><div className="calm-skeleton h-5 w-44 rounded-full" /><div className="calm-skeleton mt-8 h-56 w-full rounded-2xl" /></div><div className="card-soft h-80 rounded-[1.75rem] p-7"><div className="calm-skeleton h-5 w-32 rounded-full" /><div className="calm-skeleton mx-auto mt-10 size-32 rounded-full" /></div></div>;
  if (error) return <div className="card-soft rounded-[1.75rem] p-12 text-center"><WifiOff className="mx-auto size-8 text-danger" /><p className="mt-4 text-sm font-bold text-ink">{error}</p><button type="button" onClick={() => void load()} className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-deep px-5 py-2.5 text-xs font-bold text-onbrand"><RefreshCw className="size-3.5" />تلاش دوباره</button></div>;
  if (!report || (report.checkIns === 0 && report.exercisesCompleted === 0)) return <div className="card-soft rounded-[1.75rem] p-12 text-center"><BarChart3 className="mx-auto size-9 text-faint" /><p className="mt-4 text-base font-extrabold text-ink">گزارش تو هنوز شروع نشده</p><p className="mt-2 text-sm leading-7 text-soft">هر روز فقط چند ثانیه حال خودت را ثبت کن تا هفتهٔ آینده چیزی برای دیدن داشته باشی.</p></div>;
  const points: MoodChartPoint[] = report.entries.map((entry) => ({ label: new Date(entry.checkedInAt).toLocaleDateString("fa-IR", { weekday: "short" }), mood: entry.mood }));
  const hasMood = report.checkIns > 0;
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card-soft rounded-3xl p-5">
          <p className="text-xs font-bold text-faint">میانگین این هفته</p>
          <p className="mt-3 text-3xl font-black text-brand-ink">{hasMood ? report.average.toLocaleString("fa-IR") : "—"}</p>
          <p className="mt-1 text-[11px] text-soft">از ۱۰ امتیاز</p>
        </div>
        <div className="card-soft rounded-3xl p-5">
          <p className="text-xs font-bold text-faint">بهترین حال ثبت‌شده</p>
          <p className="mt-3 text-3xl font-black text-clay">{hasMood ? report.best.toLocaleString("fa-IR") : "—"}</p>
          <p className="mt-1 text-[11px] text-soft">{report.latestLabel ? `آخرین حال: ${report.latestLabel}` : "هنوز حالی ثبت نشده"}</p>
        </div>
        <div className="card-soft rounded-3xl p-5">
          <p className="text-xs font-bold text-faint">تمرین‌های این هفته</p>
          <p className="mt-3 flex items-center gap-2 text-3xl font-black text-brand-ink">{report.exercisesThisWeek.toLocaleString("fa-IR")}<Sparkles className="size-5" /></p>
          <p className="mt-1 text-[11px] text-soft">در مجموع: {report.exercisesCompleted.toLocaleString("fa-IR")} تمرین</p>
        </div>
        <div className="card-soft rounded-3xl p-5">
          <p className="text-xs font-bold text-faint">زنجیرهٔ تمرین</p>
          <p className="mt-3 flex items-center gap-2 text-3xl font-black text-clay">{report.exerciseStreak.toLocaleString("fa-IR")}<Flame className="size-5" /></p>
          <p className="mt-1 text-[11px] text-soft">{report.exerciseStreak > 0 ? "روز پیاپی، پابرجا مانده‌ای" : "امروز اولین قدم را بردار"}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="card-soft rounded-[1.75rem] p-6 sm:p-7">
          {hasMood ? <MoodChart data={points} /> : <div className="flex h-full min-h-56 flex-col items-center justify-center text-center"><TrendingUp className="size-8 text-faint" /><p className="mt-4 text-sm font-bold text-ink">هنوز نموداری برای نمایش نیست</p><p className="mt-2 text-xs leading-6 text-soft">با ثبت حال روزانه، روند خلق‌وخویت اینجا شکل می‌گیرد.</p></div>}
        </div>
        <div className="card-soft rounded-[1.75rem] p-6 sm:p-7">
          <CheckCircle2 className="size-7 text-brand" />
          <h2 className="mt-5 text-base font-extrabold text-ink">یادداشت اختصاصی این هفته</h2>
          <p className="mt-3 text-sm leading-7 text-soft">{report.aiInsight || (report.exercisesCompleted > 0 ? `تا امروز ${report.exercisesCompleted.toLocaleString("fa-IR")} تمرین را کامل کرده‌ای. هر کدام یک قدم رو به جلو بوده — همین پیوستگی است که تفاوت می‌سازد.` : "رشد همیشه شبیه بالا رفتن نیست. همین که به خودت سر می‌زنی، خودش مراقبت است.")}</p>
        </div>
      </div>
    </div>
  );
}
