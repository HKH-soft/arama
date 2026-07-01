"use client";

import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

type SessionPayload = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  roles?: string[];
};

interface EmotionStat {
  emotion: string;
  avgScore: number;
  count: number;
}

interface DailyStat {
  day: string;
  avgScore: number;
}

export function DashboardContent({ user }: { user: SessionPayload | null }) {
  const firstName = user?.name?.split(/\s+/)[0] || "کاربر";
  const [mounted, setMounted] = useState(false);
  const [emotionStats, setEmotionStats] = useState<EmotionStat[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [savingMood, setSavingMood] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [analyticsRes, moodsRes] = await Promise.all([
          fetch("/api/analytics"),
          fetch("/api/moods"),
        ]);

        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setEmotionStats(data.emotionBreakdown || []);
          setDailyStats(data.weeklyTrend || []);
        }

        if (moodsRes.ok) {
          const moods = await moodsRes.json();
          const latestMood = moods[moods.length - 1];
          setCurrentMood(latestMood?.currentMode || latestMood?.mood || null);
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const moodOptions = [
    { key: "عالی", icon: Smile, colorVar: "var(--mood-great)" },
    { key: "آرام", icon: Heart, colorVar: "var(--mood-calm)" },
    { key: "معمولی", icon: Meh, colorVar: "var(--mood-normal)" },
    { key: "غمگین", icon: Frown, colorVar: "var(--mood-sad)" },
    { key: "مضطرب", icon: Angry, colorVar: "var(--mood-anxious)" },
  ] as const;

  const handleMoodSelect = async (mood: string) => {
    setSavingMood(true);
    try {
      const res = await fetch("/api/moods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, mode: mood }),
      });

      if (res.ok) {
        setCurrentMood(mood);
      }
    } finally {
      setSavingMood(false);
    }
  };

  const today = mounted ? new Date().toLocaleDateString("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }) : "";

  const avgMood = emotionStats.length > 0
    ? Math.round(emotionStats.reduce((sum, e) => sum + e.avgScore, 0) / emotionStats.length)
    : 0;

  const totalSessions = emotionStats.reduce((sum, e) => sum + e.count, 0);

  const emotionChartData = emotionStats.length > 0
    ? emotionStats.map(e => ({
      subject: e.emotion,
      A: Math.round(e.avgScore),
      fullMark: 100,
    }))
    : [];

  const weeklyChartData = dailyStats.length > 0
    ? dailyStats.map((d, i) => ({
      name: ["شنبه", "یک", "دو", "سه", "چهار", "پنج", "جمعه"][i % 7],
      score: Math.round(d.avgScore),
    }))
    : [];

  if (loading) {
    return (
      <div className="px-6 py-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-52 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
    );
  }

  return (
    <>
      {/* Gradient header */}
      <div className="bg-linear-to-b from-primary/35 via-background/95 to-background px-6 pt-6 pb-4 border-b border-border/60">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              سلام، {firstName} جان 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {today}
            </p>
          </div>
        </header>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {/* Mood Check-in */}
        <section className="mt-6">
          <h2 className="text-lg font-bold text-foreground mb-3">
            امروز چه احساسی داری؟
          </h2>
          <div className="flex flex-wrap gap-3">
            {moodOptions.map((mood, i) => (
              <button
                key={i}
                onClick={() => handleMoodSelect(mood.key)}
                disabled={savingMood}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all flex-1 min-w-20 border shadow-sm ${currentMood === mood.key ? "border-primary bg-primary/10" : "border-border/70"}`}
                style={{
                  color: `hsl(${mood.colorVar})`,
                  backgroundColor: `hsl(${mood.colorVar} / 0.1)`,
                }}
              >
                <mood.icon className="w-7 h-7" style={{ color: `hsl(${mood.colorVar})` }} />
                <span className="text-sm font-medium text-foreground/90">
                  {mood.key}
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
              val: totalSessions > 0 ? totalSessions.toString() : "—",
              suffix: "جلسه",
              icon: CalendarIcon,
            },
            { label: "میانگین خلق", val: avgMood > 0 ? `${avgMood}` : "—", suffix: "٪", icon: TrendingUp },
            {
              label: "تمرین‌های انجام شده",
              val: "۳۸",
              suffix: "تمرین",
              icon: Wind,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-card/90 hover:bg-card border border-border/80 transition-all p-4 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <stat.icon className="w-4 h-4" />
                <span className="text-xs">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">
                  {stat.val}
                </span>
                <span className="text-xs text-muted-foreground/80">
                  {stat.suffix}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Radar Chart */}
          <div className="bg-card/90 border border-border rounded-lg p-5 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4 text-sm">
              نقشه احساسات (هفته جاری)
            </h3>
            {emotionChartData.length > 0 ? (
              <div className="h-55 w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={0}
                >
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  data={emotionChartData}
                >
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
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
            ) : (
              <p className="text-sm text-muted-foreground py-16 text-center">
                هنوز داده‌ای برای نمایش نقشه احساسات ثبت نشده است.
              </p>
            )}
          </div>

          {/* Line Chart */}
          <div className="md:col-span-2 bg-card/90 border border-border rounded-lg p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground text-sm">
                روند تغییرات خلقی
              </h3>
              <span className="text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1" style={{
                backgroundColor: `hsl(var(--mood-great) / 0.1)`,
                color: `hsl(var(--mood-great))`,
              }}>
                <TrendingUp className="w-3 h-3" />
                بهتر از هفته گذشته
              </span>
            </div>
            {weeklyChartData.length > 0 ? (
              <div className="h-55 w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={0}
                >
                <LineChart
                  data={weeklyChartData}
                  margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground)/60)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground)/60)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
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
            ) : (
              <p className="text-sm text-muted-foreground py-16 text-center">
                هنوز داده‌ای برای نمایش روند خلقی ثبت نشده است.
              </p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-linear-to-r from-primary/10 to-secondary/5 rounded-lg p-6 flex flex-col justify-between border border-primary/10">
            <div>
              <div className="flex items-center gap-2 text-primary font-medium mb-2 text-sm">
                <Activity className="w-5 h-5" />
                <span>پیشنهاد اختصاصی امروز</span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                مدیتیشن رهایی از استرس
              </h3>
              <p className="text-muted-foreground text-sm mb-5">
                با توجه به اینکه اخیراً سطح اضطرابت بالاتر بوده، این تمرین ۱۰
                دقیقه‌ای تنفسی به تو کمک می‌کند.
              </p>
            </div>
            <Link
              href="/meditation"
              className="w-fit flex items-center gap-2 bg-foreground text-background font-semibold px-5 py-2.5 rounded-full text-sm hover:scale-105 transition-transform"
            >
              <Play className="w-4 h-4 fill-current mr-0.5" />
              شروع تمرین
            </Link>
          </div>

          <div className="bg-muted/30 border border-border rounded-lg p-5">
            <h3 className="font-semibold text-foreground mb-3 text-sm">
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
                  className="flex items-center justify-between p-3 hover:bg-muted/40 rounded-md transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                      <Wind className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-foreground">
                        {item.title}
                      </h4>
                      <span className="text-xs text-muted-foreground/80">
                        {item.type} • {item.time}
                      </span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 text-primary-foreground fill-current mr-0.5" />
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