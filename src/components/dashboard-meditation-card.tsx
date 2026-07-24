"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AudioLines, Pause, Play, WifiOff } from "lucide-react";
import type { MeditationTrack } from "@/db/schema";
import { formatAudioTime, useMeditationPlayer } from "./meditation-provider";

export function DashboardMeditationCard() {
  const [track, setTrack] = useState<MeditationTrack | null>(null);
  const [error, setError] = useState("");
  const player = useMeditationPlayer();

  useEffect(() => {
    fetch("/api/meditation?category=%D8%AE%D9%88%D8%A7%D8%A8", { cache: "no-store" })
      .then(async (response) => {
        const body = (await response.json()) as { tracks?: MeditationTrack[]; error?: string };
        if (!response.ok) throw new Error(body.error || "خطا");
        setTrack(body.tracks?.[0] ?? null);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "صدای مدیتیشن بارگذاری نشد."));
  }, []);

  const active = !!track && player.track?.id === track.id;
  if (error) return <section className="card-soft rounded-[1.75rem] p-6"><WifiOff className="size-7 text-danger" /><p className="mt-3 text-sm font-bold text-ink">{error}</p></section>;
  if (!track) return <section className="card-soft rounded-[1.75rem] p-6"><div className="calm-skeleton h-4 w-28 rounded-full" /><div className="calm-skeleton mt-3 h-5 w-44 rounded-full" /><div className="calm-skeleton mt-7 h-12 w-full rounded-2xl" /></section>;

  const current = active ? player.currentTime : 0;
  const length = active ? player.duration || track.durationSeconds : track.durationSeconds;
  return (
    <section className="card-soft flex flex-col justify-between overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-tint/70 to-card p-6 sm:p-7">
      <div className="flex items-start gap-3">
        <Image src={track.coverArt} alt="" width={48} height={48} className="size-12 shrink-0 rounded-2xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-clay">پیشنهاد امروز آراما</p>
          <h3 className="mt-1 truncate text-base font-extrabold text-ink">{track.title}</h3>
        </div>
      </div>
      <p className="mt-4 text-xs leading-6 text-soft">{track.description}</p>
      <div className="my-5 flex h-12 items-center justify-center gap-1" aria-hidden>
        {[14, 25, 35, 20, 42, 28, 18, 35, 43, 24, 38, 20, 30, 40, 16].map((height, i) => <span key={i} className={`w-1.5 rounded-full bg-gradient-to-t from-brand-deep to-brand-glow ${active && player.isPlaying ? "wave-bar" : "opacity-50"}`} style={{ height: `${height}px`, animationDelay: `${(i % 7) * 0.16}s` }} />)}
      </div>
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => void player.playTrack(track)} aria-label={active && player.isPlaying ? "توقف مدیتیشن" : "پخش مدیتیشن"} className="grid size-12 place-items-center rounded-full bg-brand-deep text-onbrand shadow-[var(--shadow-brand)] transition-transform duration-300 hover:scale-105">{active && player.isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}</button>
        <div className="flex-1"><div className="h-1 overflow-hidden rounded-full bg-tint-strong"><div className="h-full rounded-full bg-brand-deep transition-[width] duration-300" style={{ width: `${length ? (current / length) * 100 : 0}%` }} /></div><div className="mt-2 flex justify-between text-[10px] font-bold tabular-nums text-faint"><span>{formatAudioTime(current)}</span><span>{formatAudioTime(length)}</span></div></div>
        <AudioLines className="size-5 text-brand" />
      </div>
    </section>
  );
}
