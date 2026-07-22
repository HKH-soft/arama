import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { db } from "@/db";
import { conversations, messages, moodEntries, profiles } from "@/db/schema";
import { and, desc, eq, gte, sql } from "drizzle-orm";
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
import { VoiceJournalCard } from "@/components/voice-journal-card";
import { NameSetupInline } from "@/components/name-setup-inline";
import { PersonalizedGreeting } from "@/components/personalized-greeting";

export const metadata: Metadata = { title: "داشبورد" };

function WeeklyRing({ daysDone }: { daysDone: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const done = Math.min(daysDone / 7, 1);
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
          <p className="text-xl font-black text-ink">{daysDone}/۷</p>
          <p className="text-[9px] font-bold text-faint">روز هفته</p>
        </div>
      </div>
      <div>
        <h3 className="flex items-center gap-2 text-base font-extrabold text-ink">
          <CalendarHeart className="size-4.5 text-clay" />
          گزارش هفتگی
        </h3>
        <p className="mt-2 text-xs leading-6 text-soft">
          {daysDone > 0
            ? `${daysDone} روز از هفته به خودت رسیدی. گزارش گرم این هفته‌ات آماده است.`
            : "گزارش این هفته خالی است. هنوز برای شروع دیر نیست!"}
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

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("arama-user")?.value || "temp-guest-user";

  let profile = null;
  let weeklyMoods: any[] = [];
  let recentConvs: any[] = [];
  let chats: any[] = [];

  try {
    const [fetchedProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    profile = fetchedProfile;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    weeklyMoods = await db
      .select()
      .from(moodEntries)
      .where(
        and(
          eq(moodEntries.userId, userId),
          gte(moodEntries.checkedInAt, sevenDaysAgo)
        )
      );

    recentConvs = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt))
      .limit(3);

    chats = await Promise.all(
      recentConvs.map(async (conv) => {
        const [latestMessage] = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, conv.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        const [{ count }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(messages)
          .where(eq(messages.conversationId, conv.id));

        return {
          id: conv.id,
          title: conv.title,
          preview: latestMessage?.content || "شروع گفتگو...",
          time: new Intl.DateTimeFormat("fa-IR", { dateStyle: "short" }).format(
            conv.updatedAt
          ),
          count: Number(count),
          tone: { label: "گفتگو", cls: "bg-tint-strong text-brand-ink" }, // General tone
        };
      })
    );
  } catch (err) {
    console.warn("Database connection failed. Falling back to empty state.");
  }

  // Guard: If the user has no name, show the inline setup form instead of the dashboard content
  if (profile && !profile.name) {
    return (
      <AppShell>
        <NameSetupInline />
      </AppShell>
    );
  }

  const userName = profile?.name || "دوست من";

  // Date formatting
  const today = new Date();
  const dateStr = new Intl.DateTimeFormat("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(today);

  const uniqueDays = new Set(
    weeklyMoods.map((m) => new Date(m.checkedInAt).toDateString())
  ).size;

  const todayStr = today.toDateString();
  const hasCheckedInToday = weeklyMoods.some(
    (m) => new Date(m.checkedInAt).toDateString() === todayStr
  );

  const quickActions = [
    {
      href: "/chat",
      icon: MessageCircleHeart,
      title: "شروع گفتگو",
      desc: "دلت گرفته؟ بنویس",
      tint: "bg-tint-strong text-brand-ink",
    },
    {
      href: "/exercises",
      icon: Wind,
      title: "تمرین تنفس",
      desc: "۴-۷-۸ · ۲ دقیقه",
      tint: "bg-sand-soft text-clay",
    },
    {
      href: "/meditation",
      icon: AudioLines,
      title: "مدیتیشن خواب",
      desc: "صدای آرام فارسی",
      tint: "bg-tint-strong text-brand-ink",
    },
    {
      href: "#mood",
      icon: PenLine,
      title: "ثبت خلق",
      desc: hasCheckedInToday ? "امروز ثبت کردی" : "چک‌این ۱۰ثانیه‌ای",
      tint: hasCheckedInToday ? "bg-brand/10 text-brand" : "bg-sand-soft text-clay",
      showBadge: !hasCheckedInToday,
    },
  ];

  return (
    <AppShell>
      {/* topbar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-canvas/80 px-4 py-3 backdrop-blur-xl sm:gap-4 sm:px-8 sm:py-4">
        <PersonalizedGreeting defaultName={userName} />
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
            {userName.charAt(0)}
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
            <WeeklyRing daysDone={uniqueDays} />
          </section>
        </div>

        {/* quick actions */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-4">
          {quickActions.map((a) => (
            <Link
              key={a.title}
              href={a.href}
              className="card-soft relative group flex flex-col gap-3 rounded-3xl p-4 transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] sm:p-5"
            >
              {a.showBadge && (
                <span className="absolute top-3 end-3 size-2.5 rounded-full bg-brand-deep shadow-sm" />
              )}
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

        {/* Voice of the Day */}
        <div className="mt-6">
          <VoiceJournalCard />
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
            
            {chats.length === 0 ? (
              <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-canvas/30 p-8 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-tint-strong text-brand-ink mb-3">
                  <MessageCircleHeart className="size-6" />
                </span>
                <p className="text-sm font-bold text-ink">هنوز گفتگویی نداشته‌ای</p>
                <p className="mt-1 text-xs text-soft">هر زمان حس کردی نیاز به شنیده شدن داری، من اینجام.</p>
                <Link href="/chat" className="mt-4 rounded-xl bg-brand-deep px-4 py-2 text-xs font-black text-white shadow-[var(--shadow-brand)] transition-transform hover:scale-105">
                  شروع اولین گفتگو
                </Link>
              </div>
            ) : (
              <ul className="mt-5 flex flex-col gap-3">
                {chats.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/chat?id=${c.id}`}
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
                        <span className="mt-1 block">{c.count} پیام</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* real shared meditation player */}
          <DashboardMeditationCard />
        </div>
      </main>
    </AppShell>
  );
}
