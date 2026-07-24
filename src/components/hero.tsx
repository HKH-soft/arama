import { ArrowDown, Lock, Play, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { Ambient } from "./ambient";
import { ChatMockup } from "./chat-mockup";
import { Reveal } from "./reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-12 sm:pt-36 sm:pb-20 lg:pb-28">
      <Ambient />

      {/* breathing ring — a calm focal echo behind the chat */}
      <div
        aria-hidden
        className="animate-breathe absolute -start-24 top-40 hidden size-[26rem] rounded-full border border-brand/15 lg:block"
      />
      <div
        aria-hidden
        className="animate-breathe absolute -start-10 top-54 hidden size-[26rem] rounded-full border border-brand/10 [animation-delay:1.6s] lg:block"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 sm:gap-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        {/* copy — starts from the right in RTL */}
        <div className="min-w-0">
          <Reveal>
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-brand/20 bg-card/70 py-1.5 ps-2 pe-3 text-[11px] font-semibold text-brand-ink shadow-[var(--shadow-soft)] backdrop-blur sm:pe-4 sm:text-xs">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-deep text-onbrand">
                <ShieldCheck className="size-3.5" />
              </span>
              <span className="break-safe">🔒 خصوصی • فارسی • همیشه در دسترس</span>
            </span>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="mt-5 text-[1.75rem] leading-[1.4] font-black tracking-tight text-ink sm:mt-6 sm:text-4xl sm:leading-[1.3] lg:text-[3.2rem] lg:leading-[1.25]">
              همراه هوشمند سلامت روان برای روزهای سخت و لحظه‌های آرام
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-4 max-w-lg text-sm leading-[1.8] text-soft sm:mt-5 sm:text-base sm:leading-8">
              با آراما می‌توانی هر زمان که نیاز داشتی گفتگو کنی، احساساتت را ثبت کنی، مدیتیشن انجام دهی و با تمرین‌های علمی اضطراب و استرس را بهتر مدیریت کنی.
            </p>
          </Reveal>

          <Reveal delay={360}>
            <div className="mt-7 flex flex-col items-stretch gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                href="/chat"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-deep px-6 py-3.5 text-sm font-bold text-onbrand shadow-[var(--shadow-brand)] transition-all duration-500 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 sm:px-7 sm:py-4 sm:text-base"
              >
                اولین گفتگوی رایگان
                <Sparkles className="size-4.5 transition-transform duration-500 group-hover:rotate-12" />
              </Link>
              <a
                href="#how"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-line bg-card/70 px-5 py-3.5 text-sm font-semibold text-ink backdrop-blur transition-all duration-500 hover:border-brand/35 hover:bg-card sm:px-6 sm:py-4 sm:text-base"
              >
                <span className="grid size-8 place-items-center rounded-full bg-tint text-brand-ink transition-transform duration-500 group-hover:scale-110">
                  <Play className="size-3.5 fill-current" />
                </span>
                مشاهده دموی آراما
              </a>
            </div>
          </Reveal>

          <Reveal delay={480}>
            <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-faint">
              <li className="inline-flex items-center gap-1.5">
                <Lock className="size-3.5 text-brand" /> گفتگوهای محرمانه
              </li>
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-brand" /> کاملاً فارسی
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-brand" /> تمرین‌های علمی برای مدیریت استرس
              </li>
            </ul>
          </Reveal>
        </div>

        {/* living chat visual */}
        <Reveal delay={220} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div aria-hidden className="absolute -inset-8 rounded-[3rem] bg-brand/5 blur-2xl" />
          <ChatMockup />

          {/* floating mood chip */}
          <div className="animate-breathe card-soft absolute -start-4 top-16 hidden rounded-2xl px-4 py-3 sm:block lg:-start-10">
            <p className="text-[10px] font-semibold text-faint">خلق امروز</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              {[5, 7, 6, 8, 9].map((h, i) => (
                <span
                  key={i}
                  className="w-1.5 rounded-full bg-gradient-to-t from-brand to-brand-glow"
                  style={{ height: `${h * 3}px` }}
                />
              ))}
              <span className="ms-1 text-xs font-bold text-brand-ink">رو به بهبود</span>
            </div>
          </div>

          {/* floating calm chip */}
          <div className="animate-breathe card-soft absolute -end-2 bottom-20 hidden rounded-2xl px-4 py-3 [animation-delay:1.2s] sm:block lg:-end-8">
            <p className="text-[10px] font-semibold text-faint">تمرین امروز</p>
            <p className="mt-0.5 text-xs font-bold text-clay">مدیتیشن ۱۰ دقیقه‌ای خواب</p>
          </div>
        </Reveal>
      </div>

      {/* 4 short cards: Value Proposition */}
      <div className="relative mx-auto mt-20 max-w-6xl px-4 sm:mt-24 sm:px-6">
        <h2 className="text-center text-sm font-extrabold text-soft sm:text-base">آراما چه کمکی به من می‌کند؟</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          <Reveal delay={100} className="card-soft flex flex-col items-center justify-center rounded-[1.25rem] p-5 text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
            <span className="grid size-12 place-items-center rounded-xl bg-tint-strong text-brand-ink">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><path d="M15.5 13.5v-3c0-.6-.4-1-1-1h-5c-.6 0-1 .4-1 1v3c0 .6.4 1 1 1h5c.6 0 1-.4 1-1z"/></svg>
            </span>
            <p className="mt-4 text-xs font-bold text-ink sm:text-sm">گفتگوی امن و بدون قضاوت</p>
          </Reveal>
          <Reveal delay={200} className="card-soft flex flex-col items-center justify-center rounded-[1.25rem] p-5 text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
            <span className="grid size-12 place-items-center rounded-xl bg-tint-strong text-brand-ink">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
            </span>
            <p className="mt-4 text-xs font-bold text-ink sm:text-sm">تمرین‌های روزانه برای کاهش استرس</p>
          </Reveal>
          <Reveal delay={300} className="card-soft flex flex-col items-center justify-center rounded-[1.25rem] p-5 text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
            <span className="grid size-12 place-items-center rounded-xl bg-tint-strong text-brand-ink">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            </span>
            <p className="mt-4 text-xs font-bold text-ink sm:text-sm">پیگیری حال و پیشرفت</p>
          </Reveal>
          <Reveal delay={400} className="card-soft flex flex-col items-center justify-center rounded-[1.25rem] p-5 text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
            <span className="grid size-12 place-items-center rounded-xl bg-tint-strong text-brand-ink">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg>
            </span>
            <p className="mt-4 text-xs font-bold text-ink sm:text-sm">مدیتیشن و تمرین‌های آرامش</p>
          </Reveal>
        </div>
      </div>

      <a
        href="#how"
        aria-label="ادامه به بخش بعد"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-faint transition-colors hover:text-brand-ink lg:block"
      >
        <ArrowDown className="size-5 animate-bounce [animation-duration:2.4s]" />
      </a>
    </section>
  );
}
