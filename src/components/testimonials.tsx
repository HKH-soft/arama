import { Quote } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const stories = [
  {
    name: "سارا م.",
    city: "تهران",
    tint: "from-brand/80 to-brand-deep",
    text: "اولین بار بود ساعت سه صبح، وسط یک حملهٔ پانیک، کسی بود که آرام بگوید «نفس بکش، من اینجام». آراما آن شب را برای من کوتاه‌تر کرد.",
  },
  {
    name: "امیر ر.",
    city: "اصفهان",
    tint: "from-clay/80 to-brand-deep",
    text: "فکر می‌کردم دارم با یک ربات حرف می‌زنم، ولی بعد از چند هفته دیدم مثل دوستی که روان‌شناسی خوانده، دقیق یادش است چه گفته‌ام.",
  },
  {
    name: "نگار",
    city: "شیراز",
    tint: "from-brand-glow to-brand",
    text: "گزارش‌های هفتگی‌اش باعث شد بفهمم بی‌خوابی‌ام با نگرانی‌های کاری پیوند دارد. همین یک فهم، نصفِ راه بود.",
  },
  {
    name: "کیان",
    city: "مشهد",
    tint: "from-clay to-clay/70",
    text: "به‌جای نصیحت‌کردن و قضاوت، کمکم می‌کند خودم جواب‌هایم را پیدا کنم. این فرقش با همهٔ اپ‌هاست.",
  },
];

export function Testimonials() {
  return (
    <section id="stories" className="relative scroll-mt-28 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="روایت‌های آرامش"
          title="تجربه کسانی که همراه ما هستند"
          description="صدها نفر هر شب، روزشان را با آراما مرور می‌کنند. این چند روایت، با اجازهٔ خودشان از صمیم قلب نوشته شده است."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {stories.map((s, i) => (
            <Reveal key={s.name} delay={(i % 2) * 140}>
              <figure className="card-soft group relative h-full overflow-hidden rounded-[1.75rem] p-8 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]">
                <Quote
                  aria-hidden
                  className="absolute -top-3 end-6 size-16 text-brand/8 transition-colors duration-500 group-hover:text-brand/15"
                />
                <blockquote className="relative text-base leading-8 text-ink sm:text-lg sm:leading-9">
                  «{s.text}»
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3.5">
                  <span
                    aria-hidden
                    className={`grid size-11 place-items-center rounded-full bg-gradient-to-br text-sm font-black text-white ${s.tint}`}
                  >
                    {s.name.trim().charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-ink">{s.name}</span>
                    <span className="block text-xs font-medium text-faint">کاربر آراما · {s.city}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-6 text-faint">
            آراما جایگزین درمانگر نیست؛ در بحران‌های حاد روانی، لطفاً با اورژانس اجتماعی ۱۲۳ یا روان‌درمان خود تماس بگیرید.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
