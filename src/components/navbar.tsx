"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Menu, MessageCircleHeart, X } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { CrisisModal } from "./crisis-modal";

const links = [
  { href: "/#how", label: "چطور کار می‌کند" },
  { href: "/#features", label: "امکانات" },
  { href: "/#stories", label: "روایت‌ها" },
  { href: "/#pricing", label: "تعرفه‌ها" },
  { href: "/magazine", label: "مجله آراما" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
        <nav
          aria-label="ناوبری اصلی"
          className={`mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-3xl border px-3 py-2.5 transition-all duration-700 ease-out sm:gap-4 sm:px-5 sm:py-3 ${
            scrolled
              ? "border-line bg-card/85 shadow-[var(--shadow-soft)] backdrop-blur-xl"
              : "border-transparent bg-transparent"
          }`}
        >
          <Logo size="sm" />

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-soft transition-colors duration-300 hover:bg-tint hover:text-ink"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Crisis Helpline Button */}
            <button
              type="button"
              onClick={() => setCrisisOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-300/40 bg-rose-50/70 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50 sm:px-3 sm:py-2"
              title="خطوط اورژانس و حمایت بحران روحی"
            >
              <Heart className="size-3.5 fill-current text-rose-500 animate-pulse" />
              <span className="hidden sm:inline">حمایت فوری</span>
              <span>۱۲۳</span>
            </button>

            <ThemeToggle className="hidden sm:inline-flex" />
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-brand-ink transition-colors duration-300 hover:bg-tint sm:block"
            >
              ورود
            </Link>
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full bg-brand-deep px-3.5 py-2.5 text-xs font-bold text-onbrand shadow-[var(--shadow-brand)] transition-all duration-500 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 sm:px-5 sm:text-sm"
            >
              <MessageCircleHeart className="size-4 transition-transform duration-500 group-hover:scale-110" />
              <span className="hidden xs:inline sm:inline">شروع گفتگو</span>
              <span className="sm:hidden">شروع</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "بستن منو" : "باز کردن منو"}
              aria-controls="mobile-menu"
              className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-card text-ink lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        {/* mobile sheet */}
        <div
          id="mobile-menu"
          aria-hidden={!open}
          className={`mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl border border-line bg-card/95 shadow-[var(--shadow-lift)] backdrop-blur-xl transition-all duration-500 ease-out lg:hidden ${
            open ? "max-h-[30rem] opacity-100" : "max-h-0 border-transparent opacity-0"
          }`}
        >
          <ul className="flex flex-col gap-1 p-4">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-soft transition-colors hover:bg-tint hover:text-ink"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setCrisisOpen(true);
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-rose-300/40 bg-rose-50/70 px-4 py-3 text-sm font-bold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <span className="flex items-center gap-2">
                  <Heart className="size-4 fill-current text-rose-500" />
                  خطوط مشاوره فوری و اورژانس اجتماعی
                </span>
                <span>۱۲۳</span>
              </button>
            </li>
            <li className="mt-2 flex items-center gap-3 border-t border-line pt-4">
              <Link
                href="/login"
                className="flex-1 rounded-full border border-line px-4 py-2.5 text-center text-sm font-semibold text-ink"
              >
                ورود
              </Link>
              <ThemeToggle />
            </li>
          </ul>
        </div>
      </header>

      {/* Emergency Crisis Modal */}
      <CrisisModal isOpen={crisisOpen} onClose={() => setCrisisOpen(false)} />
    </>
  );
}
