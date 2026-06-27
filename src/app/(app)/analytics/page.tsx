"use client";

import { BarChart2, TrendingUp, TrendingDown, Calendar } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <>
      <div className="bg-linear-to-b from-indigo-900/40 via-card to-card px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">تحلیل احساسات</h1>
        <p className="text-foreground/50 mt-1 text-sm">
          بررسی روند تغییرات احساسات شما در طول زمان
        </p>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "میانگین خلق هفتگی",
              val: "۷۲٪",
              trend: "up",
              icon: TrendingUp,
            },
            {
              label: "بیشترین احساس",
              val: "آرامش",
              trend: null,
              icon: BarChart2,
            },
            {
              label: "جلسات این ماه",
              val: "۲۴",
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
              className="bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-lg"
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
        </div>

        {/* Emotion breakdown */}
        <div className="bg-white/5 rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4 text-sm">
            توزیع احساسات این هفته
          </h3>
          <div className="space-y-3">
            {[
              { label: "آرامش", pct: 70, color: "bg-blue-400" },
              { label: "شادی", pct: 55, color: "bg-green-400" },
              { label: "امید", pct: 60, color: "bg-yellow-400" },
              { label: "اضطراب", pct: 30, color: "bg-red-400" },
              { label: "غم", pct: 20, color: "bg-indigo-400" },
            ].map((e, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground/80">{e.label}</span>
                  <span className="text-foreground/50">{e.pct}٪</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${e.color}`}
                    style={{ width: `${e.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly insight */}
        <div className="bg-linear-to-r from-indigo-500/20 to-purple-500/10 rounded-lg p-6 border border-indigo-500/10">
          <h3 className="font-semibold text-foreground mb-2 text-sm">
            تحلیل هفته
          </h3>
          <p className="text-foreground/60 text-sm leading-relaxed">
            این هفته سطح آرامش شما ۱۵٪ بهتر از هفته گذشته بوده. تمرینات تنفسی که
            انجام دادید تأثیر مثبتی روی کاهش اضطراب داشته. ادامه بدید!
          </p>
        </div>
      </div>
    </>
  );
}
