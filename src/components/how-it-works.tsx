import { BookHeart, ChartLine, MessageCircleHeart, Wind } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const steps = [
  {
    icon: MessageCircleHeart,
    num: "۰۱",
    title: "گفتگو می‌کنی",
    text: "هر ساعت از شبانه‌روز و از هر جا، هر چه در ذهنت می‌گذرد را می‌نویسی یا می‌گویی — آراما با دقت و بدون قضاوت گوش می‌دهد.",
    tint: "bg-tint-strong text-brand-ink",
  },
  {
    icon: ChartLine,
    num: "۰۲",
    title: "احساست را ثبت می‌کنی",
    text: "با چند ثانیه چک‌این روزانه، خلق‌وخو و احساساتت ثبت می‌شود تا الگوی درونی‌ات کم‌کم روشن شود.",
    tint: "bg-sand-soft text-clay",
  },
  {
    icon: Wind,
    num: "۰۳",
    title: "تمرین می‌کنی",
    text: "تمرین‌های تنفس، مدیتیشن هدایت‌شده و تکلیف‌های درمانیِ شخصی‌سازی‌شده برای همان لحظه‌ای که درآنی.",
    tint: "bg-tint-strong text-brand-ink",
  },
  {
    icon: BookHeart,
    num: "۰۴",
    title: "مسیرت را می‌بینی",
    text: "گزارش هفتگیِ مهربانانه بهت نشان می‌دهد کجا بودی، چه چیزی کمکت کرده و قدم بعدی کوچک چیست.",
    tint: "bg-sand-soft text-clay",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-28 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="چطور کار می‌کند"
          title="مسیر رسیدن به احساس بهتر"
          description="آراما جای درمانگر تو را نمی‌گیرد؛ همراهی است که همیشه در دسترس است — ساده، صمیمی و انسانی."
        />

        <ol className="relative mt-16 grid gap-6 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
          {/* connector */}
          <div
            aria-hidden
            className="absolute inset-x-16 top-10 hidden border-t-2 border-dashed border-line-strong lg:block"
          />
          {steps.map((s, i) => (
            <Reveal as="li" key={s.num} delay={i * 140} className="relative">
              <article className="card-soft group h-full rounded-[1.75rem] p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]">
                <div className="flex items-center justify-between">
                  <span
                    className={`grid size-14 place-items-center rounded-2xl ${s.tint} transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3`}
                  >
                    <s.icon className="size-6" strokeWidth={1.8} />
                  </span>
                  <span className="text-4xl font-black text-line-strong/70 transition-colors duration-500 group-hover:text-brand/30">
                    {s.num}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-ink">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-7 text-soft">{s.text}</p>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
