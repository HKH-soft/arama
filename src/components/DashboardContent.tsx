"use client";

import {
  Play,
  Activity,
  Wind,
  TrendingUp,
  Calendar as CalendarIcon,
  Smile,
  Frown,
  Meh,
  Angry,
  Heart,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import Link from "next/link";

const emotionData = [
  { subject: "شادی", A: 40, fullMark: 100 },
  { subject: "آرامش", A: 70, fullMark: 100 },
  { subject: "اضطراب", A: 30, fullMark: 100 },
  { subject: "غم", A: 20, fullMark: 100 },
  { subject: "امید", A: 60, fullMark: 100 },
];

const weeklyData = [
  { name: "شنبه", score: 65 },
  { name: "یک", score: 59 },
  { name: "دو", score: 80 },
  { name: "سه", score: 81 },
  { name: "چهار", score: 76 },
  { name: "پنج", score: 85 },
  { name: "جمعه", score: 90 },
];

export function DashboardContent() {

  return (
    <>
      {/* Gradient header */}
      <div className="bg-gradient-to-b from-primary/30 via-[#1a1a2e] to-[#121212] px-6 pt-6 pb-4">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              سلام، سارا جان 👋
            </h1>
            <p className="text-white/50 mt-1 text-sm">
              امروز ۲۴ مهر ۱۴۰۳
            </p>
          </div>
        </header>
      </div>

          <div className="px-6 pb-6 space-y-6">
            {/* Mood Check-in */}
            <section>
              <h2 className="text-lg font-bold text-white mb-3">
                امروز چه احساسی داری؟
              </h2>
              <div className="flex flex-wrap gap-3">
                {[
                  {
                    icon: Smile,
                    label: "عالی",
                    color: "text-green-400",
                    bg: "bg-green-500/10 hover:bg-green-500/20",
                  },
                  {
                    icon: Heart,
                    label: "آرام",
                    color: "text-blue-400",
                    bg: "bg-blue-500/10 hover:bg-blue-500/20",
                  },
                  {
                    icon: Meh,
                    label: "معمولی",
                    color: "text-yellow-400",
                    bg: "bg-yellow-500/10 hover:bg-yellow-500/20",
                  },
                  {
                    icon: Frown,
                    label: "غمگین",
                    color: "text-indigo-400",
                    bg: "bg-indigo-500/10 hover:bg-indigo-500/20",
                  },
                  {
                    icon: Angry,
                    label: "مضطرب",
                    color: "text-red-400",
                    bg: "bg-red-500/10 hover:bg-red-500/20",
                  },
                ].map((mood, i) => (
                  <button
                    key={i}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all flex-1 min-w-[80px] ${mood.bg}`}
                  >
                    <mood.icon className={`w-7 h-7 ${mood.color}`} />
                    <span className="text-sm font-medium text-white/90">
                      {mood.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "روزهای پیاپی", val: "۱۲", suffix: "روز", icon: Activity },
                {
                  label: "جلسات این ماه",
                  val: "۲۴",
                  suffix: "جلسه",
                  icon: CalendarIcon,
                },
                { label: "میانگین خلق", val: "۷۲", suffix: "٪", icon: TrendingUp },
                {
                  label: "تمرین‌های انجام شده",
                  val: "۳۸",
                  suffix: "تمرین",
                  icon: Wind,
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
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">
                      {stat.val}
                    </span>
                    <span className="text-xs text-white/40">{stat.suffix}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Radar Chart */}
              <div className="bg-white/5 rounded-lg p-5">
                <h3 className="font-semibold text-white mb-4 text-sm">
                  نقشه احساسات (هفته جاری)
                </h3>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      data={emotionData}
                    >
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={false}
                        axisLine={false}
                      />
                      <Radar
                        name="شما"
                        dataKey="A"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Line Chart */}
              <div className="md:col-span-2 bg-white/5 rounded-lg p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-white text-sm">
                    روند تغییرات خلقی
                  </h3>
                  <span className="text-xs font-medium px-2 py-1 bg-green-500/10 text-green-400 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    بهتر از هفته گذشته
                  </span>
                </div>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart
                      data={weeklyData}
                      margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(255,255,255,0.06)"
                      />
                      <XAxis
                        dataKey="name"
                        stroke="rgba(255,255,255,0.3)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.3)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a1a1a",
                          borderColor: "rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: "hsl(var(--primary))",
                          strokeWidth: 0,
                        }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-primary/20 to-secondary/10 rounded-lg p-6 flex flex-col justify-between border border-primary/10">
                <div>
                  <div className="flex items-center gap-2 text-primary font-medium mb-2 text-sm">
                    <Activity className="w-5 h-5" />
                    <span>پیشنهاد اختصاصی امروز</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    مدیتیشن رهایی از استرس
                  </h3>
                  <p className="text-white/50 text-sm mb-5">
                    با توجه به اینکه اخیراً سطح اضطرابت بالاتر بوده، این تمرین ۱۰
                    دقیقه‌ای تنفسی به تو کمک می‌کند.
                  </p>
                </div>
                <Link
                  href="/dashboard/meditation"
                  className="w-fit flex items-center gap-2 bg-white text-black font-semibold px-5 py-2.5 rounded-full text-sm hover:scale-105 transition-transform"
                >
                  <Play className="w-4 h-4 fill-black mr-0.5" />
                  شروع تمرین
                </Link>
              </div>

              <div className="bg-white/5 rounded-lg p-5">
                <h3 className="font-semibold text-white mb-3 text-sm">
                  تمرین‌های کوتاه
                </h3>
                <div className="space-y-2">
                  {[
                    { title: "آرامش ذهن", time: "۱۰ دقیقه", type: "مدیتیشن" },
                    {
                      title: "تنفس عمیق",
                      time: "۵ دقیقه",
                      type: "تمرین تنفسی",
                    },
                    {
                      title: "یوگای صبحگاهی",
                      time: "۱۵ دقیقه",
                      type: "حرکتی",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 hover:bg-white/5 rounded-md transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-white/5 flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
                          <Wind className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-white">
                            {item.title}
                          </h4>
                          <span className="text-xs text-white/40">
                            {item.type} • {item.time}
                          </span>
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-white fill-white mr-0.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
    </>
  );
}
