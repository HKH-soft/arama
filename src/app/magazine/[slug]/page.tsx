import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, CalendarDays } from "lucide-react";
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

  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      publishedTime: article.publishedAt,
      images: [
        {
          url: article.coverImage,
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
      images: [article.coverImage],
    },
  };
}

export default async function ArticlePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const article = getArticleBySlug(params.slug);
  
  if (!article) {
    notFound();
  }

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
        <Link href="/magazine" className="inline-flex items-center gap-2 text-xs font-bold text-faint hover:text-ink transition-colors mb-8">
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
                       [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:text-xl [&>h2]:font-black [&>h2]:text-ink
                       [&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-ink
                       [&>p]:mb-4"
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />
        </article>

        {/* Related Articles */}
        <div className="mt-16 border-t border-line pt-10">
          <h3 className="mb-6 text-xl font-black text-ink">شاید این مطالب هم برایتان جالب باشد</h3>
          <div className="grid gap-6 sm:grid-cols-2">
            {magazines
              .filter((m) => m.slug !== article.slug)
              .sort(() => 0.5 - Math.random())
              .slice(0, 2)
              .map((related) => (
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

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "خانه",
                  "item": "https://arama.life"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "مجله آراما",
                  "item": "https://arama.life/magazine"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": article.title,
                  "item": `https://arama.life/magazine/${article.slug}`
                }
              ]
            })
          }}
        />
      </main>
    </AppShell>
  );
}
