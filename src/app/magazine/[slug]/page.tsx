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
      </main>
    </AppShell>
  );
}
