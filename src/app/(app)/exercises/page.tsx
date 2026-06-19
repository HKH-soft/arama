"use client";

import { Play, Wind, Activity, Clock } from "lucide-react";

export default function ExercisesPage() {
  const exercises = [
    {
      title: "تنفس ۴-۷-۸",
      desc: "تکنیک آرام‌سازی سریع با تنفس عمیق",
      time: "۵ دقیقه",
      difficulty: "آسان",
      icon: Wind,
      color: "from-blue-500/20 to-cyan-500/10",
    },
    {
      title: "مدیتیشن بدن‌آگاهی",
      desc: "اسکن بدن از سر تا پا برای رهایی از تنش",
      time: "۱۵ دقیقه",
      difficulty: "متوسط",
      icon: Activity,
      color: "from-purple-500/20 to-pink-500/10",
    },
    {
      title: "تنفس جعبه‌ای",
      desc: "تنفس ۴ مرحله‌ای برای تمرکز و آرامش",
      time: "۱۰ دقیقه",
      difficulty: "آسان",
      icon: Wind,
      color: "from-green-500/20 to-emerald-500/10",
    },
    {
      title: "یوگای صبحگاهی",
      desc: "حرکات کششی ساده برای شروع روز پرانرژی",
      time: "۲۰ دقیقه",
      difficulty: "متوسط",
      icon: Activity,
      color: "from-orange-500/20 to-yellow-500/10",
    },
    {
      title: "آرامش عضلانی",
      desc: "انقباض و رهاسازی عضلات برای کاهش تنش فیزیکی",
      time: "۱۲ دقیقه",
      difficulty: "آسان",
      icon: Wind,
      color: "from-indigo-500/20 to-violet-500/10",
    },
    {
      title: "ذهن‌آگاهی در حرکت",
      desc: "پیاده‌روی آگاهانه با تمرکز بر لحظه حال",
      time: "۲۵ دقیقه",
      difficulty: "پیشرفته",
      icon: Activity,
      color: "from-rose-500/20 to-red-500/10",
    },
  ];

  return (
    <>
      <div className="bg-gradient-to-b from-emerald-900/40 via-[#1a1a2e] to-[#121212] px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white">تمرینات</h1>
        <p className="text-white/50 mt-1 text-sm">
          تمرین‌های آرام‌سازی و ذهن‌آگاهی برای سلامت روان
        </p>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap">
          {["همه", "تنفسی", "مدیتیشن", "حرکتی", "ذهن‌آگاهی"].map(
            (chip, i) => (
              <button
                key={i}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  i === 0
                    ? "bg-white text-black"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {chip}
              </button>
            )
          )}
        </div>

        {/* Exercise grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${ex.color} rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all group cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <ex.icon className="w-5 h-5 text-white/70" />
                </div>
                <span className="text-[11px] text-white/40 bg-white/5 px-2 py-1 rounded-full">
                  {ex.difficulty}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                {ex.title}
              </h3>
              <p className="text-white/50 text-sm mb-4 leading-relaxed">
                {ex.desc}
              </p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-white/40 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  {ex.time}
                </span>
                <button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-primary/30">
                  <Play className="w-4 h-4 text-white fill-white mr-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
