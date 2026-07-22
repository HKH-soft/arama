import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { magazines } from "@/data/magazines";

export const metadata: Metadata = {
  title: "آراما مگ — مجله سلامت روان",
  description: "جدیدترین مقالات، راهنماها و مطالب علمی درباره سلامت روان، کنترل اضطراب و ذهن‌آگاهی در آراما مگ.",
};

export default function MagazinePage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <header className="mb-10 text-center sm:text-start">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3.5 py-1.5 text-[11px] font-black text-brand"><BookOpen className="size-3.5" />آراما مگ</span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-4xl">مجله سلامت روان</h1>
          <p className="mt-4 mx-auto sm:mx-0 max-w-xl text-sm leading-7 text-soft">
            مقالاتی برای درک بهتر خودمان؛ از مدیریت اضطراب تا تمرینات ذهن‌آگاهی و اهمیت ابراز احساسات.
          </p>
        </header>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {magazines.map((article) => (
            <Link
              key={article.slug}
              href={`/magazine/${article.slug}`}
              className="group card-soft overflow-hidden rounded-[1.75rem] flex flex-col transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-tint-strong">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col flex-1 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 text-[10px] font-bold text-faint mb-3">
                  <time dateTime={article.publishedAt}>
                    {new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date(article.publishedAt))}
                  </time>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {article.readTimeMinutes} دقیقه مطالعه
                  </span>
                </div>
                <h2 className="text-base font-extrabold text-ink line-clamp-2 leading-tight group-hover:text-brand-ink transition-colors">
                  {article.title}
                </h2>
                <p className="mt-3 text-xs leading-6 text-soft line-clamp-3 flex-1">
                  {article.summary}
                </p>
                <div className="mt-5 text-[11px] font-black text-brand-ink flex items-center gap-1">
                  خواندن مقاله
                  <span className="transition-transform group-hover:-translate-x-1">←</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
