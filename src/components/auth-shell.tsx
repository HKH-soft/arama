import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Quote } from "lucide-react";
import { Ambient } from "./ambient";
import { Logo } from "./logo";

export function AuthShell({
  title,
  subtitle,
  children,
  aside,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  aside: ReactNode;
}) {
  return (
    <main className="relative flex min-h-dvh items-start justify-center overflow-x-clip px-3 py-6 sm:items-center sm:px-6 sm:py-10">
      <Ambient />

      <Link
        href="/"
        className="absolute end-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-line bg-card/80 px-3 py-2 text-[11px] font-bold text-soft backdrop-blur transition-colors hover:text-brand-ink sm:end-5 sm:top-5 sm:px-4 sm:text-xs"
      >
        <ChevronRight className="size-4" />
        بازگشت به خانه
      </Link>

      <div className="card-soft relative mt-12 grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] sm:mt-0 sm:rounded-[2.5rem] lg:grid-cols-[1fr_1.05fr]">
        {/* warm brand panel */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-bl from-brand-deep via-brand to-brand-glow p-10 text-white lg:flex">
          <div aria-hidden className="absolute inset-0">
            <div className="animate-breathe absolute -top-20 -end-20 size-72 rounded-full border border-white/20" />
            <div className="animate-breathe absolute top-24 -start-16 size-80 rounded-full bg-white/10 blur-2xl [animation-delay:1.2s]" />
            <div className="animate-breathe absolute -bottom-24 end-8 size-72 rounded-full bg-sand/25 blur-2xl [animation-delay:0.6s]" />
          </div>
          <Logo size="lg" className="relative [&_span]:text-white!" />
          <div className="relative">
            <Quote className="size-8 text-white/50" aria-hidden />
            <p className="mt-4 max-w-sm text-xl leading-10 font-bold">
              «گاهی فقط لازم است کسی بگوید: می‌شنومَت. آراما همان کس است — در هر ساعت، برای همه.»
            </p>
            <p className="mt-5 text-sm font-medium text-white/75">تیم آراما، با تمام قلب</p>
          </div>
        </aside>

        {/* form panel */}
        <section className="p-5 sm:p-10 lg:p-12">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          <header className="mt-6 lg:mt-2">
            <h1 className="text-xl font-black tracking-tight text-ink sm:text-3xl">{title}</h1>
            <p className="mt-3 text-sm leading-7 text-soft">{subtitle}</p>
          </header>
          <div className="mt-6 sm:mt-8">{children}</div>
          {aside}
        </section>
      </div>
    </main>
  );
}
