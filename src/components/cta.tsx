import { MessageCircleHeart, MoonStar } from "lucide-react";
import Link from "next/link";
import { Reveal } from "./reveal";

export function Cta() {
  return (
    <section className="px-6 pb-24 sm:pb-32">
      <Reveal className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-bl from-brand-deep via-brand to-brand-glow px-8 py-16 text-center shadow-[var(--shadow-lift)] sm:px-16 sm:py-20">
          {/* breathing rings */}
          <div aria-hidden className="absolute inset-0">
            <div className="animate-breathe absolute -top-24 start-1/2 size-72 -translate-x-1/2 rounded-full border border-white/20" />
            <div className="animate-breathe absolute -top-10 start-1/2 size-72 -translate-x-1/2 rounded-full border border-white/15 [animation-delay:1.4s]" />
            <div className="animate-breathe absolute -bottom-28 end-10 size-80 rounded-full bg-white/10 blur-2xl [animation-delay:0.8s]" />
            <div className="animate-breathe absolute -bottom-16 start-8 size-60 rounded-full bg-sand/25 blur-2xl" />
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold text-white backdrop-blur">
              <MoonStar className="size-3.5" />
              همین امشب، یک قدم کوچک
            </span>
            <h2 className="mx-auto mt-6 max-w-2xl text-3xl leading-snug font-black text-white sm:text-4xl sm:leading-[1.5]">
              امشب بار ذهنت را زمین بگذار
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-white/85">
              اولین گفتگو رایگان است؛ بدون ثبت کارت و بدون تعهد. کافیست چند جمله بنویسی تا شروع کنیم.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/chat"
                className="group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-base font-black text-brand-ink shadow-[0_16px_40px_-12px_rgb(0_0_0/0.35)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-12px_rgb(0_0_0/0.45)]"
              >
                <MessageCircleHeart className="size-5 transition-transform duration-500 group-hover:scale-110" />
                شروع گفتگوی رایگان
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-white/40 px-7 py-4 text-base font-bold text-white transition-all duration-500 hover:bg-white/10"
              >
                ساخت حساب
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
