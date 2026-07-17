"use client";

import { useEffect, useState } from "react";
import { BarChart3, WifiOff } from "lucide-react";
import { MoodChart, type MoodChartPoint } from "./mood-chart";

function LoadingChart() {
  return <div className="space-y-5"><div className="flex justify-between"><div className="calm-skeleton h-5 w-40 rounded-full" /><div className="calm-skeleton h-7 w-32 rounded-full" /></div><div className="calm-skeleton h-52 w-full rounded-2xl" /></div>;
}

export function MoodDataPanel() {
  const [data, setData] = useState<MoodChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/mood", { cache: "no-store" });
      const body = (await response.json()) as { entries?: Array<{ mood: number; checkedInAt: string }>; error?: string };
      if (!response.ok) throw new Error(body.error || "خطا");
      setData((body.entries ?? []).map((entry) => ({ label: new Date(entry.checkedInAt).toLocaleDateString("fa-IR", { weekday: "short" }), mood: entry.mood })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "نمودار خلق‌وخو بارگذاری نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  if (loading) return <LoadingChart />;
  if (error) return <div className="py-8 text-center"><WifiOff className="mx-auto size-8 text-danger" /><p className="mt-3 text-sm font-bold text-ink">{error}</p><button type="button" onClick={() => void load()} className="mt-4 rounded-full bg-brand-deep px-5 py-2.5 text-xs font-bold text-onbrand">دوباره تلاش کن</button></div>;
  if (data.length === 0) return <div className="py-8 text-center"><BarChart3 className="mx-auto size-9 text-faint" /><p className="mt-3 text-sm font-extrabold text-ink">هنوز چک‌این ثبت نکرده‌ای</p><p className="mt-2 text-xs leading-6 text-soft">از بخش «ثبت خلق» شروع کن تا نمودار مسیرت را نشان دهد.</p></div>;
  return <MoodChart data={data} />;
}
