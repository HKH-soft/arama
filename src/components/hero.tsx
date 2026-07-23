import { ArrowDown, Lock, Play, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { Ambient } from "./ambient";
import { ChatMockup } from "./chat-mockup";
import { Reveal } from "./reveal";
import { RotatingWord } from "./rotating-word";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-44 sm:pb-20 lg:pb-28">
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
              <span className="break-safe">نسل جدید سلامت روان — فارسی، امن، همیشه در دسترس</span>
            </span>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="mt-6 text-[1.9rem] leading-[1.45] font-black tracking-tight text-ink sm:mt-7 sm:text-5xl sm:leading-[1.3] lg:text-[3.4rem] lg:leading-[1.3]">
              جایی برای رهایی از فشار روزمره؛
              <br />
              گفتگویی امن،{" "}
              <RotatingWord
                className="text-gradient"
                words={["با همدلی", "با شکیبایی", "با پذیرش", "با گرمای انسانی"]}
              />
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-5 max-w-lg text-sm leading-8 text-soft sm:mt-6 sm:text-lg sm:leading-9">
              آراما، همراه هوشمند سلامت روان توست؛ وقتی غم سنگینی می‌کند، وقتی خواب از سرت پریده، وقتی فقط به
              یک شنوندهٔ بی‌قضاوت نیاز داری — فارسی، همیشه در دسترس و آمادهٔ شنیدن.
            </p>
          </Reveal>

          <Reveal delay={360}>
            <div className="mt-7 flex flex-col items-stretch gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                href="/chat"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-deep px-6 py-3.5 text-sm font-bold text-onbrand shadow-[var(--shadow-brand)] transition-all duration-500 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 sm:px-7 sm:py-4 sm:text-base"
              >
                شروع گفتگو
                <Sparkles className="size-4.5 transition-transform duration-500 group-hover:rotate-12" />
              </Link>
              <a
                href="#how"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-line bg-card/70 px-5 py-3.5 text-sm font-semibold text-ink backdrop-blur transition-all duration-500 hover:border-brand/35 hover:bg-card sm:px-6 sm:py-4 sm:text-base"
              >
                <span className="grid size-8 place-items-center rounded-full bg-tint text-brand-ink transition-transform duration-500 group-hover:scale-110">
                  <Play className="size-3.5 fill-current" />
                </span>
                ببین چطور کار می‌کند
              </a>
            </div>
          </Reveal>

          <Reveal delay={480}>
            <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-faint">
              <li className="inline-flex items-center gap-1.5">
                <Lock className="size-3.5 text-brand" /> گفتگوهای تو رمزنگاری و محرمانه‌اند
              </li>
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-brand" /> طراحی‌شده با روان‌درمانان
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-brand" /> بدون نوبت، بدون انتظار
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
