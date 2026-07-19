import {
  AudioLines,
  CalendarHeart,
  ChartLine,
  MessageCircleHeart,
  ShieldCheck,
  Wind,
} from "lucide-react";
import { Ambient } from "./ambient";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

/** mini sparkline for mood card */
function Spark() {
  const points = [18, 14, 16, 10, 12, 7, 8, 4];
  const w = 200;
  const h = 48;
  const step = w / (points.length - 1);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${p}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-5 h-14 w-full" aria-hidden>
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill="url(#spark-fill)" />
      <path d={d} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={w} cy={points[points.length - 1]} r="4" fill="var(--brand-deep)" stroke="var(--card)" strokeWidth="2" />
    </svg>
  );
}

/** mini meditation player */
function Player() {
  return (
    <div className="mt-5 flex items-center gap-4 rounded-2xl border border-line bg-canvas/60 p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-deep text-onbrand">
        <AudioLines className="size-5" />
      </span>
      <div className="flex h-8 flex-1 items-center justify-center gap-1" aria-hidden>
        {[10, 18, 26, 14, 22, 30, 16, 24, 12, 20, 28, 15, 9, 19, 25, 13].map((v, i) => (
          <span
            key={i}
            className="wave-bar w-1 rounded-full bg-brand/70"
            style={{ height: `${v}px`, animationDelay: `${(i % 6) * 0.18}s` }}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-brand-ink tabular-nums">۰۸:۲۴</span>
    </div>
  );
}

const items = [
  {
    icon: MessageCircleHeart,
    title: "گفتگوی درمانی با هوش مصنوعی",
    text: "هر ساعت از شبانه‌روز با یک همراه فارسی‌زبان حرف می‌زنی که بر پایهٔ روش‌های شناختی‌رفتاری پاسخ می‌دهد و صبورانه گوش می‌سپارد.",
    visual: "chat",
  },
  {
    icon: ChartLine,
    title: "ردیابی خلق‌وخو با نمودار",
    text: "با یک چک‌این چندثانیه‌ای در روز حالت را ثبت می‌کنی و نمودارها الگوی خواب، اضطراب و انرژی‌ات را در طول زمان نشان می‌دهند.",
    visual: "spark",
  },
  {
    icon: AudioLines,
    title: "مدیتیشن هدایت‌شده",
    text: "کتابخانه‌ای از فایل‌های صوتی فارسی برای خواب، تمرکز و مدیریت خشم؛ یک صدای همراه برای لحظه‌هایی که به مکث نیاز داری.",
    visual: "player",
  },
  {
    icon: Wind,
    title: "تمرین‌های درمانی",
    text: "تمرین‌های گام‌به‌گام مثل تنفس ۴-۷-۸، زمین‌گیری ۵-۴-۳-۲-۱ و بازنویسی افکار خودکار، متناسب با احساسی که همان لحظه داری.",
    visual: null,
  },
  {
    icon: CalendarHeart,
    title: "گزارش هفتگی رشد",
    text: "هر هفته خلاصه‌ای خوانا از روند خلق و تمرین‌هایت دریافت می‌کنی؛ روایتی از تلاش‌های کوچک تو، نه صرفاً یک مشت عدد.",
    visual: null,
  },
  {
    icon: ShieldCheck,
    title: "امنیت و محرمانگی کامل",
    text: "همهٔ داده‌هایت رمزنگاری می‌شود، هرگز فروخته نمی‌شود و هر زمان بخواهی با یک کلیک برای همیشه پاک می‌شود.",
    visual: null,
  },
];

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-28 overflow-hidden bg-tint/60 py-24 sm:py-32">
      <Ambient variant="deep" />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="امکانات آراما"
          title="مجموعه ابزارهای مراقبت از خود"
          description="پنج ابزار کاربردی در کنار هم: گفتگو، ثبت خلق، مدیتیشن، تمرین و گزارش — ساده، به‌هم‌پیوسته و در دسترس."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 130}>
              <article
                className={`card-soft group flex h-full flex-col rounded-[1.75rem] p-7 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)] ${
                  i === 0 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <span className="grid size-13 place-items-center rounded-2xl bg-tint-strong text-brand-ink transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <f.icon className="size-6" strokeWidth={1.8} />
                </span>
                <h3 className="mt-5 text-lg font-extrabold text-ink">{f.title}</h3>
                <p className="mt-2.5 flex-1 text-sm leading-7 text-soft">{f.text}</p>
                {f.visual === "spark" && <Spark />}
                {f.visual === "player" && <Player />}
                {f.visual === "chat" && (
                  <div className="mt-5 flex items-center gap-2 rounded-2xl bg-tint px-4 py-3">
                    <span className="typing-dot size-1.5 rounded-full bg-brand-ink" />
                    <span className="typing-dot size-1.5 rounded-full bg-brand-ink" />
                    <span className="typing-dot size-1.5 rounded-full bg-brand-ink" />
                    <span className="ms-2 text-[11px] font-semibold text-faint">آراما دارد با دقت می‌خواند…</span>
                  </div>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
