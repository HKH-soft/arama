"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AudioLines, CheckCircle2, Clock3, Play, Search, WifiOff } from "lucide-react";
import type { MeditationTrack } from "@/db/schema";
import { formatAudioTime, useMeditationPlayer } from "./meditation-provider";

type Track = MeditationTrack;

function LibrarySkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="در حال آماده‌سازی کتابخانه">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="card-soft overflow-hidden rounded-[1.75rem] p-4">
          <div className="calm-skeleton aspect-[1.7] rounded-2xl" />
          <div className="calm-skeleton mt-5 h-5 w-3/4 rounded-full" />
          <div className="calm-skeleton mt-3 h-3 w-full rounded-full" />
          <div className="calm-skeleton mt-2 h-3 w-1/2 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function TrackCard({ track }: { track: Track }) {
  const player = useMeditationPlayer();
  const active = player.track?.id === track.id;
  const progress = active && player.duration ? Math.min(100, (player.currentTime / player.duration) * 100) : 0;
  return (
    <article className={`card-soft group overflow-hidden rounded-[1.75rem] transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] ${active ? "border-brand/40" : ""}`}>
      <div className="relative aspect-[1.7] overflow-hidden">
        <Image src={track.coverArt} alt="" fill sizes="(min-width: 1280px) 30vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute start-4 top-4 rounded-full bg-card/90 px-3 py-1.5 text-[10px] font-black text-brand-ink backdrop-blur">{track.category}</span>
        {active && <span className="absolute end-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-brand-deep/90 px-3 py-1.5 text-[10px] font-black text-onbrand"><span className="size-1.5 animate-pulse rounded-full bg-onbrand" />{player.isPlaying ? "در حال پخش" : "متوقف"}</span>}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-ink">{track.title}</h3>
            <p className="mt-2 text-xs leading-6 text-soft">{track.description}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-faint"><Clock3 className="size-3.5" />{formatAudioTime(active ? player.duration || track.durationSeconds : track.durationSeconds)}</span>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button type="button" onClick={() => void player.playTrack(track)} aria-label={`${active && player.isPlaying ? "توقف" : "پخش"} ${track.title}`} className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-deep text-onbrand shadow-[var(--shadow-brand)] transition-transform duration-300 hover:scale-105">
            {active && player.isPlaying ? <span className="flex items-center gap-0.5"><span className="h-4 w-1 rounded-full bg-onbrand" /><span className="h-4 w-1 rounded-full bg-onbrand" /></span> : <Play className="size-4.5 fill-current" />}
          </button>
          <div className="flex h-7 flex-1 items-center gap-1" aria-hidden>
            {[12, 20, 16, 26, 18, 29, 15, 23, 12, 20, 25, 16].map((height, i) => <span key={i} className={`w-1 rounded-full bg-brand/70 ${active && player.isPlaying ? "wave-bar" : "opacity-55"}`} style={{ height: `${height}px`, animationDelay: `${i * 0.09}s` }} />)}
          </div>
        </div>
        {active && <div className="mt-3 h-1 overflow-hidden rounded-full bg-tint-strong"><div className="h-full rounded-full bg-brand-deep transition-[width] duration-300" style={{ width: `${progress}%` }} /></div>}
      </div>
    </article>
  );
}

export function MeditationLibrary() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [categories, setCategories] = useState<string[]>(["همه"]);
  const [category, setCategory] = useState("همه");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const player = useMeditationPlayer();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ category });
      if (search.trim()) query.set("search", search.trim());
      const response = await fetch(`/api/meditation?${query.toString()}`, { cache: "no-store" });
      const data = (await response.json()) as { tracks?: Track[]; categories?: string[]; error?: string };
      if (!response.ok) throw new Error(data.error || "خطا");
      setTracks(data.tracks ?? []);
      setCategories(data.categories ?? ["همه"]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "کتابخانهٔ مدیتیشن بارگذاری نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), search ? 280 : 0);
    return () => window.clearTimeout(timer);
  }, [category, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const continueText = useMemo(() => {
    if (!player.track || player.currentTime < 3) return null;
    return `از ${formatAudioTime(player.currentTime)} ادامه بده: ${player.track.title}`;
  }, [player.track, player.currentTime]);

  return (
    <div>
      {continueText && (
        <button type="button" onClick={() => void player.togglePlay()} className="mb-6 flex w-full items-center gap-4 rounded-3xl border border-brand/25 bg-tint-strong/60 p-4 text-start transition-colors hover:bg-tint-strong">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-deep text-onbrand"><CheckCircle2 className="size-5" /></span>
          <span className="flex-1"><span className="block text-xs font-black text-brand-ink">ادامه از جایی که ماندی</span><span className="mt-1 block text-sm font-bold text-ink">{continueText}</span></span>
          <Play className="size-4 fill-current text-brand-ink" />
        </button>
      )}

      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-line bg-card/70 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1"><Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-faint" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو در صداها…" className="w-full rounded-2xl border border-line bg-canvas/60 py-3 ps-11 pe-4 text-sm text-ink outline-none transition-all focus:border-brand focus:bg-card" /></div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition-colors ${category === item ? "bg-brand-deep text-onbrand" : "border border-line bg-card text-soft hover:bg-tint"}`}>{item}</button>)}
        </div>
      </div>

      <div className="mt-7" aria-live="polite">
        {loading && <LibrarySkeleton />}
        {!loading && error && <div className="card-soft rounded-[1.75rem] p-10 text-center"><WifiOff className="mx-auto size-8 text-danger" /><p className="mt-4 text-sm font-bold text-ink">{error}</p><button type="button" onClick={() => void load()} className="mt-5 rounded-full bg-brand-deep px-5 py-2.5 text-xs font-bold text-onbrand">دوباره تلاش کن</button></div>}
        {!loading && !error && tracks.length === 0 && <div className="card-soft rounded-[1.75rem] p-12 text-center"><AudioLines className="mx-auto size-9 text-faint" /><p className="mt-4 text-base font-extrabold text-ink">هنوز صدایی با این جستجو پیدا نکردیم</p><p className="mt-2 text-sm text-soft">دستهٔ دیگری را امتحان کن یا جستجو را پاک کن.</p></div>}
        {!loading && !error && tracks.length > 0 && <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{tracks.map((track) => <TrackCard key={track.id} track={track} />)}</div>}
      </div>
    </div>
  );
}
