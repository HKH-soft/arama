import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, CalendarDays, HelpCircle, ChevronDown } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getArticleBySlug, magazines } from "@/data/magazines";

export async function generateStaticParams() {
  return magazines.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const article = getArticleBySlug(params.slug);
  if (!article) return { title: "مقاله پیدا نشد" };

  const canonicalUrl = `https://arama.life/magazine/${article.slug}`;
  const imageUrl = article.coverImage.startsWith("http")
    ? article.coverImage
    : `https://arama.life${article.coverImage}`;

  return {
    title: `${article.title} | مجله سلامت روان آراما`,
    description: article.summary,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: article.keywords ?? [
      "سلامت روان",
      "آراما",
      "مدیتیشن",
      "تراپی آنلاین",
      "کاهش اضطراب",
      article.title,
    ],
    openGraph: {
      title: article.title,
      description: article.summary,
      url: canonicalUrl,
      siteName: "آراما — همراه هوشمند سلامت روان",
      locale: "fa_IR",
      type: "article",
      publishedTime: article.publishedAt,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: [imageUrl],
    },
  };
}

export default async function ArticlePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const article = getArticleBySlug(params.slug);
  
  if (!article) {
    notFound();
  }

  const canonicalUrl = `https://arama.life/magazine/${article.slug}`;
  const imageUrl = article.coverImage.startsWith("http")
    ? article.coverImage
    : `https://arama.life${article.coverImage}`;

  const otherArticles = magazines.filter((m) => m.slug !== article.slug);
  const idx = magazines.findIndex((m) => m.slug === article.slug);
  const related1 = otherArticles[idx >= 0 ? idx % otherArticles.length : 0];
  const related2 = otherArticles[idx >= 0 ? (idx + 1) % otherArticles.length : 1];
  const relatedList = [related1, related2].filter(Boolean);

  // Schema.org Article Structured Data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    "headline": article.title,
    "description": article.summary,
    "image": [imageUrl],
    "datePublished": article.publishedAt,
    "dateModified": article.publishedAt,
    "inLanguage": "fa-IR",
    "author": {
      "@type": "Organization",
      "name": "تیم تحریریه آراما",
      "url": "https://arama.life",
    },
    "publisher": {
      "@type": "Organization",
      "name": "آراما",
      "url": "https://arama.life",
      "logo": {
        "@type": "ImageObject",
        "url": "https://arama.life/icon-192.png",
      },
    },
  };

  // Schema.org Breadcrumbs
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "خانه",
        "item": "https://arama.life",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "مجله آراما",
        "item": "https://arama.life/magazine",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": canonicalUrl,
      },
    ],
  };

  // Schema.org FAQPage (if FAQs present)
  const faqSchema =
    article.faqs && article.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": article.faqs.map((f) => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": f.answer,
            },
          })),
        }
      : null;

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
        <Link
          href="/magazine"
          className="inline-flex items-center gap-2 text-xs font-bold text-faint hover:text-ink transition-colors mb-8"
        >
          <ArrowRight className="size-4" />
          بازگشت به مجله
        </Link>
        
        <article>
          <header className="mb-10 text-center sm:text-start">
            <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl leading-tight sm:leading-tight">
              {article.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[11px] font-bold text-soft">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4 text-faint" />
                {new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date(article.publishedAt))}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4 text-faint" />
                {article.readTimeMinutes} دقیقه مطالعه
              </span>
            </div>
          </header>

          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[2rem] bg-tint-strong shadow-[var(--shadow-lift)] mb-10">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority
              sizes="(min-width: 1024px) 896px, 100vw"
              className="object-cover"
            />
          </div>

          <div 
            className="mt-10 space-y-6 text-sm sm:text-base leading-8 text-soft
                       [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-black [&>h2]:text-ink
                       [&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-ink
                       [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pr-6 [&>ul]:space-y-2 [&>ol]:list-decimal [&>ol]:pr-6 [&>ol]:space-y-2
                       [&>blockquote]:my-6 [&>blockquote]:border-r-4 [&>blockquote]:border-brand-deep [&>blockquote]:bg-tint-strong/50 [&>blockquote]:p-4 [&>blockquote]:rounded-l-2xl [&>blockquote]:italic [&>blockquote]:font-bold"
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />

          {/* Interactive FAQs Section if present */}
          {article.faqs && article.faqs.length > 0 && (
            <section className="mt-14 rounded-[2rem] border border-line bg-card/70 p-6 sm:p-8">
              <h2 className="text-xl font-black text-ink flex items-center gap-2 mb-6">
                <HelpCircle className="size-5 text-brand-ink" />
                پرسش‌های متداول شما
              </h2>
              <div className="space-y-4">
                {article.faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group rounded-2xl border border-line/80 bg-canvas/60 p-4 transition-colors open:bg-tint/40"
                  >
                    <summary className="cursor-pointer list-none flex items-center justify-between gap-3 text-sm font-bold text-ink">
                      <span>{faq.question}</span>
                      <ChevronDown className="size-4 text-faint transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-xs sm:text-sm leading-7 text-soft pr-1">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* CTA Banner: Try Arama AI Therapy */}
          <div className="mt-14 rounded-[2rem] bg-gradient-to-br from-brand-deep to-brand-glow p-8 text-white text-center sm:text-start flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[var(--shadow-brand)]">
            <div>
              <h3 className="text-lg font-black">نیاز به هم‌صحبتی امن و بدون قضاوت داری؟</h3>
              <p className="mt-2 text-xs sm:text-sm text-white/90 max-w-md leading-6">
                آراما به عنوان دستیار هوشمند سلامت روان، هر لحظه از شبانه‌روز آماده گوش دادن به دغدغه‌ها و ارائه تمرین‌های آرامش‌بخش است.
              </p>
            </div>
            <Link
              href="/chat"
              className="shrink-0 rounded-full bg-white px-6 py-3.5 text-xs font-black text-brand-deep shadow-md transition-all hover:scale-105"
            >
              شروع گفتگوی رایگان
            </Link>
          </div>
        </article>

        {/* Related Articles */}
        <div className="mt-16 border-t border-line pt-10">
          <h3 className="mb-6 text-xl font-black text-ink">شاید این مطالب هم برایتان جالب باشد</h3>
          <div className="grid gap-6 sm:grid-cols-2">
            {relatedList.map((related) => (
              <Link
                key={related.slug}
                href={`/magazine/${related.slug}`}
                className="group flex gap-4 rounded-2xl border border-line bg-card p-4 transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={related.coverImage}
                    alt={related.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink line-clamp-2">{related.title}</h4>
                  <span className="mt-2 block text-xs font-medium text-faint">{related.readTimeMinutes} دقیقه مطالعه</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* JSON-LD Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        )}
      </main>
    </AppShell>
  );
}
