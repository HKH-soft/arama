"use client";

import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  BarChart2,
} from "lucide-react";

export default function ReportsPage() {
  const reports = [
    {
      title: "گزارش ماهانه - خرداد ۱۴۰۴",
      desc: "خلاصه عملکرد و پیشرفت روانی شما",
      date: "۱ تیر ۱۴۰۴",
      type: "ماهانه",
    },
    {
      title: "گزارش ماهانه - اردیبهشت ۱۴۰۴",
      desc: "خلاصه عملکرد و پیشرفت روانی شما",
      date: "۱ خرداد ۱۴۰۴",
      type: "ماهانه",
    },
    {
      title: "گزارش هفتگی - هفته چهارم خرداد",
      desc: "تحلیل احساسات و تمرینات انجام شده",
      date: "۳۱ خرداد ۱۴۰۴",
      type: "هفتگی",
    },
    {
      title: "گزارش هفتگی - هفته سوم خرداد",
      desc: "تحلیل احساسات و تمرینات انجام شده",
      date: "۲۴ خرداد ۱۴۰۴",
      type: "هفتگی",
    },
  ];

  return (
    <>
      <div className="bg-gradient-to-b from-amber-900/30 via-[#1a1a2e] to-[#121212] px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white">گزارش‌ها</h1>
        <p className="text-white/50 mt-1 text-sm">
          مشاهده پیشرفت و تاریخچه فعالیت‌های شما
        </p>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            {
              label: "میانگین خلق ماهانه",
              val: "۷۵٪",
              change: "+۵٪",
              icon: TrendingUp,
            },
            {
              label: "روزهای فعال",
              val: "۲۶",
              change: "از ۳۰ روز",
              icon: Calendar,
            },
            {
              label: "تعداد گزارش‌ها",
              val: "۸",
              change: "این ماه",
              icon: BarChart2,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-lg"
            >
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <stat.icon className="w-4 h-4" />
                <span className="text-xs">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {stat.val}
                </span>
                <span className="text-xs text-green-400">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Report list */}
        <div className="space-y-3">
          <h3 className="font-semibold text-white text-sm">گزارش‌های شما</h3>
          {reports.map((report, i) => (
            <div
              key={i}
              className="bg-white/5 hover:bg-white/10 transition-colors rounded-lg p-4 flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/50">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {report.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-white/40">{report.date}</span>
                    <span className="text-[10px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded">
                      {report.type}
                    </span>
                  </div>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-white/10">
                <Download className="w-4 h-4 text-white/60" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
