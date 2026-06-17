"use client";

import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import {
  Play, Activity, Wind, TrendingUp, Calendar as CalendarIcon,
  Smile, Frown, Meh, Angry, Heart
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import { motion } from "framer-motion";

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
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8">

          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">سلام، سارا جان 👋</h1>
              <p className="text-muted-foreground mt-1">امروز ۲۴ مهر ۱۴۰۳</p>
            </div>
          </header>

          {/* Mood Check-in */}
          <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">امروز چه احساسی داری؟</h2>
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Smile, label: "عالی", color: "text-green-500", bg: "bg-green-500/10 hover:bg-green-500/20" },
                { icon: Heart, label: "آرام", color: "text-blue-500", bg: "bg-blue-500/10 hover:bg-blue-500/20" },
                { icon: Meh, label: "معمولی", color: "text-yellow-500", bg: "bg-yellow-500/10 hover:bg-yellow-500/20" },
                { icon: Frown, label: "غمگین", color: "text-indigo-500", bg: "bg-indigo-500/10 hover:bg-indigo-500/20" },
                { icon: Angry, label: "مضطرب", color: "text-red-500", bg: "bg-red-500/10 hover:bg-red-500/20" },
              ].map((mood, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all flex-1 min-w-[80px] ${mood.bg} border border-transparent hover:border-${mood.color.split("-")[1]}-200`}
                >
                  <mood.icon className={`w-8 h-8 ${mood.color}`} />
                  <span className="text-sm font-medium text-foreground">{mood.label}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "روزهای پیاپی", val: "۱۲", suffix: "روز", icon: Activity },
                { label: "جلسات این ماه", val: "۲۴", suffix: "جلسه", icon: CalendarIcon },
                { label: "میانگین خلق", val: "۷۲", suffix: "٪", icon: TrendingUp },
                { label: "تمرین‌های انجام شده", val: "۳۸", suffix: "تمرین", icon: Wind },
              ].map((stat, i) => (
                <div key={i} className="bg-card p-5 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <stat.icon className="w-4 h-4" />
                    <span className="text-sm">{stat.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">{stat.val}</span>
                    <span className="text-xs text-muted-foreground">{stat.suffix}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Radar Chart */}
            <div className="col-span-1 md:col-span-1 bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">نقشه احساسات (هفته جاری)</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={emotionData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="شما" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line Chart */}
            <div className="col-span-1 md:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-foreground">روند تغییرات خلقی</h3>
                <span className="text-xs font-medium px-2 py-1 bg-green-500/10 text-green-500 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  بهتر از هفته گذشته
                </span>
              </div>
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recommendations */}
            <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-primary font-medium mb-2">
                    <Activity className="w-5 h-5" />
                    <span>پیشنهاد اختصاصی امروز</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">مدیتیشن رهایی از استرس</h3>
                  <p className="text-muted-foreground text-sm mb-6">با توجه به اینکه اخیراً سطح اضطرابت بالاتر بوده، این تمرین ۱۰ دقیقه‌ای تنفسی به تو کمک می‌کند.</p>
                </div>
                <Button className="w-fit gap-2">
                  <Play className="w-4 h-4" />
                  شروع تمرین
                </Button>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">تمرین‌های کوتاه</h3>
                <div className="space-y-3">
                  {[
                    { title: "آرامش ذهن", time: "۱۰ دقیقه", type: "مدیتیشن" },
                    { title: "تنفس عمیق", time: "۵ دقیقه", type: "تمرین تنفسی" },
                    { title: "یوگای صبحگاهی", time: "۱۵ دقیقه", type: "حرکتی" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Wind className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-foreground">{item.title}</h4>
                          <span className="text-xs text-muted-foreground">{item.type} • {item.time}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-primary" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
