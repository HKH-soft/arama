"use client";

import { useState, useEffect } from "react";
import { BarChart2, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface EmotionData {
  emotion: string;
  avgScore: number;
  count: number;
}

interface WeeklyData {
  day: string;
  avgScore: number;
}

export default function AnalyticsPage() {
  const [emotionBreakdown, setEmotionBreakdown] = useState<EmotionData[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics");
        const data = await res.json();
        setEmotionBreakdown(data.emotionBreakdown || []);
        setWeeklyTrend(data.weeklyTrend || []);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <>
      <div className="bg-linear-to-b from-indigo-900/50 via-card to-card px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">تحلیل احساسات</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          بررسی روند تغییرات احساسات شما در طول زمان
        </p>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        )}

        {/* Summary cards */}
        {!loading && <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "میانگین خلق هفتگی",
              val: weeklyTrend.length > 0 ? `${Math.round(weeklyTrend.reduce((sum, d) => sum + d.avgScore, 0) / weeklyTrend.length)}٪` : "—",
              trend: "up",
              icon: TrendingUp,
            },
            {
              label: "بیشترین احساس",
              val: emotionBreakdown.length > 0 ? emotionBreakdown.reduce((max, e) => e.avgScore > max.avgScore ? e : max, emotionBreakdown[0]).emotion : "—",
              trend: null,
              icon: BarChart2,
            },
            {
              label: "جلسات این ماه",
              val: emotionBreakdown.length > 0 ? emotionBreakdown.reduce((sum, e) => sum + e.count, 0).toString() : "—",
              trend: "up",
              icon: Calendar,
            },
            {
              label: "سطح استرس",
              val: "متوسط",
              trend: "down",
              icon: TrendingDown,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-card/90 hover:bg-card transition-colors p-4 rounded-lg border border-border shadow-sm"
            >
              <div className="flex items-center gap-2 text-foreground/50 mb-2">
                <stat.icon className="w-4 h-4" />
                <span className="text-xs">{stat.label}</span>
              </div>
              <span className="text-2xl font-bold text-foreground">
                {stat.val}
              </span>
            </div>
          ))}
        </div>}

        {/* Emotion breakdown */}
        {!loading && <div className="bg-card/90 rounded-lg p-5 border border-border shadow-sm">
          <h3 className="font-semibold text-foreground mb-4 text-sm">
            توزیع احساسات این هفته
          </h3>
          <div className="space-y-3">
            {emotionBreakdown.length > 0 ? (
              emotionBreakdown.map((e, i) => {
                const colors: Record<string, string> = {
                  "آرامش": "bg-blue-400",
                  "شادی": "bg-green-400",
                  "امید": "bg-yellow-400",
                  "اضطراب": "bg-red-400",
                  "غم": "bg-indigo-400",
                };
                const colorClass = colors[e.emotion] || "bg-gray-400";
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground/80">{e.emotion}</span>
                      <span className="text-foreground/50">{Math.round(e.avgScore)}٪</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colorClass}`}
                        style={{ width: `${e.avgScore}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground">داده‌ای یافت نشد</p>
            )}
          </div>
        </div>}

        {/* Weekly insight */}
        {!loading && <div className="bg-linear-to-r from-indigo-500/20 to-purple-500/10 rounded-lg p-6 border border-indigo-500/10 shadow-sm">
          <h3 className="font-semibold text-foreground mb-2 text-sm">
            تحلیل هفته
          </h3>
          <p className="text-foreground/60 text-sm leading-relaxed">
            {weeklyTrend.length >= 2
              ? `این هفته سطح احساسات شما ${Math.round(weeklyTrend[weeklyTrend.length - 1].avgScore - weeklyTrend[0].avgScore)}٪ تغییر داشته. ادامه کنیم!`
              : "در حال جمع‌آوری داده‌های هفته جاری..."}
          </p>
        </div>}
      </div>
    </>
  );
}