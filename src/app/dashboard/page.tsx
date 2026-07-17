import type { Metadata } from "next";
import Link from "next/link";
import {
  AudioLines,
  Bell,
  CalendarHeart,
  ChevronLeft,
  MessageCircleHeart,
  PenLine,
  Wind,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DashboardMeditationCard } from "@/components/dashboard-meditation-card";
import { MoodCheckin } from "@/components/mood-checkin";
import { MoodDataPanel } from "@/components/mood-data-panel";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = { title: "داشبورد" };

const quickActions = [
  {
    href: "/chat",
    icon: MessageCircleHeart,
    title: "شروع گفتگو",
    desc: "دلت گرفته؟ بنویس",
    tint: "bg-tint-strong text-brand-ink",
  },
  { href: "/chat", icon: Wind, title: "تمرین تنفس", desc: "۴-۷-۸ · ۲ دقیقه", tint: "bg-sand-soft text-clay" },
  {
    href: "/chat",
    icon: AudioLines,
    title: "مدیتیشن خواب",
    desc: "صدای آرام فارسی",
    tint: "bg-tint-strong text-brand-ink",
  },
  { href: "#mood", icon: PenLine, title: "ثبت خلق", desc: "چک‌این ۱۰ثانیه‌ای", tint: "bg-sand-soft text-clay" },
];

const chats = [
  {
    title: "اضطراب مصاحبهٔ کاری",
    preview: "حسم بعد از تمرین تنفس بهتر شد، ولی هنوز…",
    time: "دیروز",
    count: "۲۴ پیام",
    tone: { label: "اضطراب", cls: "bg-sand-soft text-clay" },
  },
  {
    title: "بی‌خوابی شبانه",
    preview: "مدیتیشن خواب را گوش دادم و وسطش خوابم برد…",
    time: "۳ روز پیش",
    count: "۱۱ پیام",
    tone: { label: "آرام", cls: "bg-tint-strong text-brand-ink" },
  },
  {
    title: "شکرگزاری صبحگاهی",
    preview: "امروز برای بارش باران بعد از مدت‌ها قدردانم…",
    time: "امروز",
    count: "۵ پیام",
    tone: { label: "امید", cls: "bg-tint-strong text-brand-ink" },
  },
];

function WeeklyRing() {
  const r = 46;
  const c = 2 * Math.PI * r;
  const done = 6 / 7;
  return (
    <div className="flex items-center gap-6">
      <div className="relative grid size-28 shrink-0 place-items-center">
        <svg viewBox="0 0 112 112" className="size-28 -rotate-90">
          <circle cx="56" cy="56" r={r} fill="none" stroke="var(--tint-strong)" strokeWidth="11" />
          <circle
            cx="56"
            cy="56"
            r={r}
            fill="none"
            stroke="var(--brand-deep)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={`${c * done} ${c}`}
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-xl font-black text-ink">۶/۷</p>
          <p className="text-[9px] font-bold text-faint">روز هفته</p>
        </div>
      </div>
      <div>
        <h3 className="flex items-center gap-2 text-base font-extrabold text-ink">
          <CalendarHeart className="size-4.5 text-clay" />
          گزارش هفتگی
        </h3>
        <p className="mt-2 text-xs leading-6 text-soft">
          شش روز از هفته به خودت رسیدی. گزارش گرم این هفته‌ات <strong className="text-brand-ink">آماده است</strong>.
        </p>
        <Link
          href="/dashboard"
          className="group mt-3 inline-flex items-center gap-1 text-xs font-black text-brand-ink"
        >
          خواندن گزارش
          <ChevronLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppShell>
      {/* topbar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-canvas/80 px-4 py-3 backdrop-blur-xl sm:gap-4 sm:px-8 sm:py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-clay">دوشنبه، ۲۸ آبان ماه</p>
          <h1 className="mt-0.5 truncate text-base font-black text-ink sm:text-xl">سلام سارا، خوشحالم که برگشتی</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            aria-label="اعلان‌ها"
            className="relative grid size-10 place-items-center rounded-full border border-line bg-card text-soft transition-colors hover:text-brand-ink"
          >
            <Bell className="size-4.5" />
            <span className="absolute end-2 top-2 size-2 rounded-full bg-clay" aria-hidden />
          </button>
          <span className="hidden sm:inline-flex lg:hidden">
            <ThemeToggle />
          </span>
          <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-brand-glow to-brand-deep text-sm font-black text-white lg:hidden">
            س
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
        {/* mood check-in */}
        <section id="mood" className="card-soft rounded-[1.5rem] p-4 sm:rounded-[1.75rem] sm:p-7">
          <h2 className="text-base font-extrabold text-ink">این لحظه، دلت چطوره؟</h2>
          <div className="mt-5">
            <MoodCheckin />
          </div>
        </section>

        {/* chart + report */}
        <div className="mt-5 grid gap-5 sm:mt-6 sm:gap-6 lg:grid-cols-3">
          <section className="card-soft rounded-[1.5rem] p-4 sm:rounded-[1.75rem] sm:p-7 lg:col-span-2">
            <MoodDataPanel />
          </section>
          <section className="card-soft flex items-center rounded-[1.5rem] p-4 sm:rounded-[1.75rem] sm:p-7">
            <WeeklyRing />
          </section>
        </div>

        {/* quick actions */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-4">
          {quickActions.map((a) => (
            <Link
              key={a.title}
              href={a.href}
              className="card-soft group flex flex-col gap-3 rounded-3xl p-4 transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] sm:p-5"
            >
              <span
                className={`grid size-10 place-items-center rounded-2xl sm:size-11 ${a.tint} transition-transform duration-500 group-hover:scale-110`}
              >
                <a.icon className="size-5" strokeWidth={1.9} />
              </span>
              <span>
                <span className="block text-sm font-extrabold text-ink">{a.title}</span>
                <span className="mt-1 block text-[11px] font-medium text-faint">{a.desc}</span>
              </span>
            </Link>
          ))}
        </div>

        {/* recent chats + meditation */}
        <div className="mt-6 grid gap-6 pb-8 lg:grid-cols-3">
          <section className="card-soft rounded-[1.75rem] p-6 sm:p-7 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-ink">گفتگوهای اخیر</h2>
              <Link href="/chat" className="group inline-flex items-center gap-1 text-xs font-black text-brand-ink">
                همهٔ گفتگوها
                <ChevronLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
              </Link>
            </div>
            <ul className="mt-5 flex flex-col gap-3">
              {chats.map((c) => (
                <li key={c.title}>
                  <Link
                    href="/chat"
                    className="group flex items-center gap-4 rounded-2xl border border-line bg-canvas/50 p-4 transition-all duration-300 hover:border-brand/30 hover:bg-tint/60"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-tint-strong text-brand-ink">
                      <MessageCircleHeart className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold text-ink">{c.title}</span>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${c.tone.cls}`}>
                          {c.tone.label}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-faint">{c.preview}</span>
                    </span>
                    <span className="shrink-0 text-end text-[10px] font-semibold text-faint">
                      {c.time}
                      <span className="mt-1 block">{c.count}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* real shared meditation player */}
          <DashboardMeditationCard />
        </div>
      </main>
    </AppShell>
  );
}
