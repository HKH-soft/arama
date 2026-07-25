"use client";

import { Info } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const faqs = [
  {
    q: "آیا مکالمات من محرمانه است؟",
    a: "بله. پیام‌های تو فقط بین تو و آراماست. ما هیچ‌وقت داده‌هایت را به کسی نمی‌فروشیم و خودت می‌توانی هر زمان خواستی تمام چت‌هایت را پاک کنی.",
  },
  {
    q: "آیا هوش مصنوعی می‌تواند جایگزین درمانگر انسانی من شود؟",
    a: "نه. آراما یک ابزار همراه و حمایتگر است، نه جایگزین درمانگر انسانی. اگر در شرایط بحرانی هستی، لطفاً حتماً با متخصص یا اورژانس اجتماعی ۱۲۳ تماس بگیر.",
  },
  {
    q: "چگونه می‌توانم تاریخچه چت‌هایم را پاک کنم؟",
    a: "تو کنترل کامل روی داده‌هایت داری. از بخش تنظیمات پروفایل می‌توانی تاریخچهٔ یک گفتگو یا کل حساب کاربریت را برای همیشه و غیرقابل‌بازگشت پاک کنی.",
  },
  {
    q: "آیا می‌توانم اشتراکم را هر زمان که خواستم لغو کنم؟",
    a: "بله، بدون هیچ سوالی. هر زمان خواستی می‌توانی اشتراکت را از پنل کاربری لغو کنی. بعد از لغو، تا پایان دوره فعلی همچنان به امکانات دسترسی داری و پولی کسر نمی‌شود.",
  },
];

export function FAQ() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <section id="faq" className="bg-canvas py-24 sm:py-32" aria-labelledby="faq-heading">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading
          eyebrow="پاسخ به سوالات تو"
          title="شفافیت؛ اصول آراما"
          description="سلامت روان نیاز به فضای قابل اعتماد داره. جواب رایج‌ترین سوالاتت اینجاست."
        />
        
        <div className="mt-16 space-y-4">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 100}>
              <details className="group rounded-3xl border border-line bg-card/50 p-6 transition-all duration-300 hover:border-brand/40 hover:bg-tint/30 open:border-brand-deep open:bg-tint-strong/30 open:shadow-[var(--shadow-soft)]">
                <summary className="flex cursor-pointer items-center justify-between text-base font-extrabold text-ink outline-none transition-colors group-focus-visible:text-brand-deep group-hover:text-brand-deep">
                  {faq.q}
                  <span className="relative ml-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand-deep transition-transform duration-300 group-open:rotate-180">
                    <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-8 text-soft opacity-0 transition-opacity duration-300 group-open:opacity-100">
                  {faq.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
        
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-start rounded-2xl bg-brand/5 p-6 border border-brand/10">
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-deep text-onbrand shadow-[var(--shadow-brand)]">
            <Info className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-ink">سوال دیگری داری؟</h4>
            <p className="mt-1 text-xs text-soft">تیم پشتیبانی ما همیشه آماده‌ی شنیدن صدای توست. به ما ایمیل بزن.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
