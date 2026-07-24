"use client";

import { Info } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const faqs = [
  {
    q: "آیا مکالمات من خصوصی و امن هستند؟",
    a: "بله، حریم خصوصی شما بالاترین اولویت ماست. تمام مکالمات شما با استفاده از استانداردهای پیشرفته رمزنگاری می‌شوند و داده‌های هویتی شما کاملاً ایزوله هستند. ما هرگز داده‌های شما را به اشخاص ثالث نمی‌فروشیم و شما کنترل کامل بر داده‌های خود دارید.",
  },
  {
    q: "آیا هوش مصنوعی می‌تواند جایگزین درمانگر انسانی من شود؟",
    a: "خیر. آراما یک ابزار حمایتگر، همراهِ امن و فضایی برای تمرین ذهن‌آگاهی است و به هیچ عنوان جایگزین تشخیص، مشاوره بالینی یا درمان روانپزشکی نیست. اگر در شرایط بحرانی هستید، لطفاً حتماً با متخصصان یا اورژانس اجتماعی تماس بگیرید.",
  },
  {
    q: "چگونه می‌توانم تاریخچه چت‌هایم را پاک کنم؟",
    a: "شما کنترل کامل روی داده‌هایتان دارید. در هر زمان می‌توانید با مراجعه به بخش «تنظیمات حریم خصوصی» در پروفایل خود، تاریخچه یک گفتگوی خاص یا تمام داده‌های حساب کاربری خود را برای همیشه و به صورت غیرقابل‌بازگشت پاک کنید.",
  },
  {
    q: "آیا می‌توانم اشتراکم را هر زمان که خواستم لغو کنم؟",
    a: "بله، بدون هیچ‌گونه پیچیدگی یا سوالی. شما می‌توانید در هر لحظه اشتراک خود را از پنل کاربری لغو کنید. در این صورت، اشتراک شما تا پایان دوره فعلی فعال می‌ماند و پس از آن تمدید نخواهد شد.",
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
          eyebrow="پاسخ به سوالات شما"
          title="شفافیت و امنیت؛ اصول آراما"
          description="ما می‌دانیم که سلامت روان نیازمند فضایی امن و قابل اعتماد است. پاسخ رایج‌ترین سوالات شما اینجاست."
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
            <h4 className="text-sm font-bold text-ink">سوال دیگری دارید؟</h4>
            <p className="mt-1 text-xs text-soft">تیم پشتیبانی ما همیشه آماده‌ی شنیدن صدای شماست. به ما ایمیل بزنید.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
