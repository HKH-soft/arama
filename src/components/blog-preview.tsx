import Image from "next/image";
import { ArrowLeft, Clock3 } from "lucide-react";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const posts = [
  {
    slug: "why-cant-we-sleep",
    img: "/images/blog-sleep.jpg",
    category: "خواب و آرامش",
    time: "۷ دقیقه",
    title: "چرا نمی‌توانیم بخوابیم؟ راهنمای آرام‌کردن ذهن پیش از خواب",
    excerpt: "وقتی چراغ‌ها خاموش می‌شود، ذهن چرا روشن می‌ماند؟ پنج تمرین کوتاه برای تحویل‌دادن فکرها به شب.",
  },
  {
    slug: "meditation-for-beginners",
    img: "/images/blog-meditation.jpg",
    category: "مدیتیشن",
    time: "۵ دقیقه",
    title: "هرج‌ومرج ذهنی؛ مدیتیشن برای کسانی که «نمی‌توانند»",
    excerpt: "اگر هر بار که چشم‌هایت را می‌بندی فکرها هجوم می‌آورند، این راهنمای کوتاه دقیقاً برای توست.",
  },
  {
    slug: "kinder-self-talk",
    img: "/images/blog-selftalk.jpg",
    category: "خودمراقبتی",
    time: "۶ دقیقه",
    title: "مکالمه با خود؛ چطور مهربان‌تر با خودمان حرف بزنیم؟",
    excerpt: "صدای درونی‌مان قدرتمندترین صدایی است که می‌شنویم. یاد بگیریم لحنش را مهربان‌تر کنیم.",
  },
];

export function BlogPreview() {
  return (
    <section id="blog" className="scroll-mt-28 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="مجله آراما"
          title="مقالاتی برای آگاهی و یادگیری"
          description="مقاله‌های کوتاه و علمی، با زبانی صمیمی — برای لحظه‌هایی که می‌خواهی خودت را بهتر بشناسی."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={p.slug} delay={i * 130}>
              <a href={`#blog`} className="group block h-full">
                <article className="card-soft h-full overflow-hidden rounded-[1.75rem] transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[var(--shadow-lift)]">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={p.img}
                      alt={p.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    />
                    <span className="absolute start-4 top-4 rounded-full bg-card/90 px-3 py-1.5 text-[11px] font-bold text-brand-ink backdrop-blur">
                      {p.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-base font-extrabold leading-7 text-ink transition-colors duration-300 group-hover:text-brand-ink">
                      {p.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-7 text-soft">{p.excerpt}</p>
                    <p className="mt-5 flex items-center gap-1.5 text-[11px] font-semibold text-faint">
                      <Clock3 className="size-3.5" />
                      زمان مطالعه: {p.time}
                    </p>
                  </div>
                </article>
              </a>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Reveal delay={180}>
            <a
              href="#blog"
              className="group inline-flex items-center gap-2 rounded-full border border-line bg-card px-6 py-3 text-sm font-bold text-brand-ink transition-all duration-500 hover:border-brand/40 hover:bg-tint shadow-[var(--shadow-soft)]"
            >
              همهٔ مقاله‌ها
              <ArrowLeft className="size-4 transition-transform duration-500 group-hover:-translate-x-1" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
