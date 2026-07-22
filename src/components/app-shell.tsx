"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AudioLines,
  BarChart3,
  BookOpen,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  MessageCircleHeart,
  Settings,
  UserRound,
  Wind,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const nav = [
  { href: "/dashboard", label: "داشبورد", icon: LayoutDashboard },
  { href: "/chat", label: "گفتگو", icon: MessageCircleHeart },
  { href: "/exercises", label: "تمرین‌ها", icon: Wind },
  { href: "/meditation", label: "مدیتیشن", icon: AudioLines },
  { href: "/reports", label: "گزارش‌ها", icon: BarChart3 },
  { href: "/session-management", label: "تاریخچه", icon: BookOpen },
  { href: "/billing", label: "اشتراک", icon: CreditCard },
  { href: "/profile", label: "پروفایل", icon: UserRound },
  { href: "/settings", label: "تنظیمات", icon: Settings },
];

const mobilePrimary = nav.slice(0, 4);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      try {
        const [profileRes, subRes] = await Promise.all([
          fetch("/api/profile", { cache: "no-store" }),
          fetch("/api/subscription", { cache: "no-store" }),
        ]);

        if (profileRes.ok) {
          const pData = await profileRes.json();
          setProfileName(pData.profile?.name || "کاربر آراما");
        } else {
          setProfileName("کاربر آراما");
        }

        if (subRes.ok) {
          const sData = await subRes.json();
          setPlanName(sData.subscription?.plan?.name || "پلن رایگان");
        } else {
          setPlanName("پلن رایگان");
        }
      } catch (error) {
        setProfileName("کاربر آراما");
        setPlanName("پلن رایگان");
      } finally {
        setLoadingUser(false);
      }
    }
    void loadUserData();
  }, []);

  return (
    <div className="flex min-h-dvh bg-canvas">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col gap-1.5 border-e border-line bg-card/70 p-5 backdrop-blur lg:flex">
        <div className="px-2 pb-5">
          <Logo size="sm" />
        </div>

        <nav aria-label="ناوبری اپلیکیشن" className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
          {nav.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.label}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  active ? "bg-tint-strong text-brand-ink" : "text-soft hover:bg-tint hover:text-ink"
                }`}
              >
                <n.icon className="size-5 transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="rounded-3xl border border-sand bg-sand-soft/70 p-4">
          <p className="flex items-center gap-2 text-xs font-extrabold text-clay">
            <LifeBuoy className="size-4" />
            نیاز فوری به کمک؟
          </p>
          <p className="mt-2 text-[11px] leading-5 text-soft">
            اگر در بحران روانی هستی، با اورژانس اجتماعی <strong className="text-ink">۱۲۳</strong> تماس بگیر.
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 rounded-3xl border border-line bg-card p-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {loadingUser ? (
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-line/50 animate-pulse" />
            ) : (
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-glow to-brand-deep text-sm font-black text-white">
                {profileName?.[0] ?? "ک"}
              </span>
            )}
            <div className="min-w-0">
              {loadingUser ? (
                <>
                  <div className="h-3 w-16 bg-line/50 rounded animate-pulse mb-1.5" />
                  <div className="h-2 w-12 bg-line/50 rounded animate-pulse" />
                </>
              ) : (
                <>
                  <p className="truncate text-xs font-bold text-ink">{profileName}</p>
                  <p className="text-[10px] font-medium text-faint">{planName}</p>
                </>
              )}
            </div>
          </div>
          <ThemeToggle />
        </div>
      </aside>

      {/* content */}
      <div className="flex min-w-0 flex-1 flex-col pb-28 lg:pb-0">{children}</div>

      {/* mobile bottom nav */}
      <nav
        aria-label="ناوبری موبایل"
        className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-1 rounded-[1.75rem] border border-line bg-card/95 px-2 py-2 shadow-[var(--shadow-lift)] backdrop-blur-xl sm:inset-x-4 lg:hidden"
      >
        {mobilePrimary.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.label}
              href={n.href}
              aria-current={active ? "page" : undefined}
              aria-label={n.label}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-bold transition-colors ${
                active ? "bg-tint-strong text-brand-ink" : "text-faint hover:text-ink"
              }`}
            >
              <n.icon className="size-5" />
              <span className="truncate">{n.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="منوی بیشتر"
          className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-bold transition-colors ${
            menuOpen ? "bg-tint-strong text-brand-ink" : "text-faint hover:text-ink"
          }`}
        >
          <Menu className="size-5" />
          <span>بیشتر</span>
        </button>
      </nav>

      {/* mobile full menu sheet */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="بستن منو"
            className="absolute inset-0 bg-ink/35 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[2rem] border border-line bg-card p-5 shadow-[var(--shadow-lift)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-extrabold text-ink">منوی آراما</p>
                <p className="mt-1 text-xs text-faint">همهٔ بخش‌ها در یک نگاه</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="بستن"
                className="grid size-10 place-items-center rounded-full border border-line text-soft"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {nav.map((n) => {
                const active = pathname === n.href;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex flex-col items-center gap-2 rounded-3xl border p-4 text-center transition-colors ${
                      active
                        ? "border-brand/30 bg-tint-strong text-brand-ink"
                        : "border-line bg-canvas/50 text-soft hover:bg-tint"
                    }`}
                  >
                    <n.icon className="size-5" />
                    <span className="text-[11px] font-bold leading-5">{n.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-3xl border border-line bg-canvas/60 p-4">
              <div className="flex items-center gap-3">
                {loadingUser ? (
                  <div className="grid size-11 place-items-center rounded-full bg-line/50 animate-pulse" />
                ) : (
                  <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-brand-glow to-brand-deep text-sm font-black text-white">
                    {profileName?.[0] ?? "ک"}
                  </span>
                )}
                <div>
                  {loadingUser ? (
                    <>
                      <div className="h-3.5 w-20 bg-line/50 rounded animate-pulse mb-1.5" />
                      <div className="h-2.5 w-14 bg-line/50 rounded animate-pulse" />
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-ink">{profileName}</p>
                      <p className="text-[11px] text-faint">{planName}</p>
                    </>
                  )}
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
