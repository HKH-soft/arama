"use client";

import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Pause, Play, Volume2, X } from "lucide-react";
import type { MeditationTrack } from "@/db/schema";

type PlayerContextValue = {
  track: MeditationTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  error: string | null;
  playTrack: (track: MeditationTrack) => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  closePlayer: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function formatAudioTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "۰۰:۰۰";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toLocaleString("fa-IR", { minimumIntegerDigits: 2 })}:${secs.toLocaleString("fa-IR", { minimumIntegerDigits: 2 })}`;
}

function safeProgressKey(id: string) {
  return `arama-meditation-progress-${id}`;
}

export function MeditationProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const pendingSeekRef = useRef(0);
  const [track, setTrack] = useState<MeditationTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedVolume = Number(localStorage.getItem("arama-volume"));
      if (Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 1) setVolumeState(savedVolume);
      const savedTrack = localStorage.getItem("arama-last-track");
      if (savedTrack) setTrack(JSON.parse(savedTrack) as MeditationTrack);
    } catch {
      // private mode or malformed local state — start cleanly
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track || audio.src === track.audioUrl) return;
    const saved = Number(localStorage.getItem(safeProgressKey(track.id)) || 0);
    pendingSeekRef.current = Number.isFinite(saved) ? saved : 0;
    audio.src = track.audioUrl;
    audio.load();
  }, [track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      if (track) localStorage.setItem(safeProgressKey(track.id), String(audio.currentTime));
    };
    const onLoaded = () => {
      const nextDuration = Number.isFinite(audio.duration) ? audio.duration : track?.durationSeconds ?? 0;
      setDuration(nextDuration);
      audio.currentTime = Math.min(pendingSeekRef.current, nextDuration || pendingSeekRef.current);
      pendingSeekRef.current = 0;
      setIsLoading(false);
    };
    const onPlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (track) localStorage.removeItem(safeProgressKey(track.id));
    };
    const onError = () => {
      setIsPlaying(false);
      setIsLoading(false);
      setError("پخش این فایل صوتی ممکن نشد؛ می‌توانی دوباره تلاش کنی.");
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("durationchange", onLoaded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("durationchange", onLoaded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [track]);

  const playTrack = useCallback(async (nextTrack: MeditationTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(null);
    if (track?.id === nextTrack.id && audio.src) {
      if (audio.paused) {
        setIsLoading(true);
        try {
          await audio.play();
        } catch {
          setIsLoading(false);
          setError("مرورگر اجازهٔ پخش خودکار را نداد؛ دوباره روی پخش بزن.");
        }
      } else {
        audio.pause();
      }
      return;
    }

    setTrack(nextTrack);
    localStorage.setItem("arama-last-track", JSON.stringify(nextTrack));
    const saved = Number(localStorage.getItem(safeProgressKey(nextTrack.id)) || 0);
    pendingSeekRef.current = Number.isFinite(saved) ? saved : 0;
    setCurrentTime(pendingSeekRef.current);
    setDuration(nextTrack.durationSeconds);
    setIsLoading(true);
    audio.src = nextTrack.audioUrl;
    audio.load();
    try {
      await audio.play();
    } catch {
      setIsLoading(false);
      setError("برای شروع پخش، یک‌بار دیگر روی دکمهٔ پخش بزن.");
    }
  }, [track]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    setError(null);
    if (audio.paused) {
      setIsLoading(true);
      try {
        await audio.play();
      } catch {
        setIsLoading(false);
        setError("پخش صوت شروع نشد؛ اتصال اینترنت را بررسی کن.");
      }
    } else {
      audio.pause();
    }
  }, [track]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((next: number) => {
    const value = Math.min(1, Math.max(0, next));
    setVolumeState(value);
    localStorage.setItem("arama-volume", String(value));
  }, []);

  const closePlayer = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current?.removeAttribute("src");
    audioRef.current?.load();
    setTrack(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    localStorage.removeItem("arama-last-track");
  }, []);

  const value = useMemo<PlayerContextValue>(() => ({
    track,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    error,
    playTrack,
    togglePlay,
    seek,
    setVolume,
    closePlayer,
  }), [track, isPlaying, isLoading, currentTime, duration, volume, error, playTrack, togglePlay, seek, setVolume, closePlayer]);

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="metadata" aria-hidden="true" />
      <MiniPlayer />
    </PlayerContext.Provider>
  );
}

export function useMeditationPlayer() {
  const value = useContext(PlayerContext);
  if (!value) throw new Error("useMeditationPlayer must be used inside MeditationProvider");
  return value;
}

function MiniWaveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-8 items-center justify-center gap-1" aria-hidden>
      {[10, 18, 26, 15, 23, 29, 18, 25, 13, 20, 27].map((height, i) => (
        <span
          key={i}
          className={`w-1 rounded-full bg-brand ${active ? "wave-bar" : "opacity-60"}`}
          style={{ height: `${height}px`, animationDelay: `${(i % 6) * 0.14}s` }}
        />
      ))}
    </div>
  );
}

export function MiniPlayer() {
  const { track, isPlaying, isLoading, currentTime, duration, volume, error, togglePlay, seek, setVolume, closePlayer } = useMeditationPlayer();
  if (!track) return null;
  const max = duration || track.durationSeconds || 1;
  const progress = Math.min(100, Math.max(0, (currentTime / max) * 100));

  return (
    <aside className="fixed inset-x-3 bottom-[5.75rem] z-50 mx-auto max-w-xl overflow-hidden rounded-[1.5rem] border border-line bg-card/95 shadow-[var(--shadow-lift)] backdrop-blur-xl sm:inset-x-4 lg:bottom-5 lg:start-1/2 lg:end-auto lg:w-[min(36rem,calc(100vw-2rem))] lg:-translate-x-1/2 lg:rtl:translate-x-1/2">
      <div className="flex items-center gap-2.5 px-3 py-3 sm:gap-3 sm:px-4">
        <Image src={track.coverArt} alt="" width={48} height={48} className="size-11 shrink-0 rounded-2xl object-cover sm:size-12" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-extrabold text-ink">{track.title}</p>
          <p className="mt-0.5 truncate text-[10px] font-medium text-faint">{track.category} · ادامه از {formatAudioTime(currentTime)}</p>
          <div className="hidden sm:block">
            <MiniWaveform active={isPlaying} />
          </div>
        </div>
        <button type="button" onClick={togglePlay} disabled={isLoading} aria-label={isPlaying ? "توقف" : "پخش"} className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-deep text-onbrand shadow-[var(--shadow-brand)] disabled:opacity-60 sm:size-11">
          {isLoading ? <span className="animate-breathe size-3 rounded-full bg-onbrand" /> : isPlaying ? <Pause className="size-4.5 fill-current" /> : <Play className="size-4.5 fill-current" />}
        </button>
        <button type="button" onClick={closePlayer} aria-label="بستن پخش‌کننده" className="grid size-9 shrink-0 place-items-center rounded-full text-faint hover:bg-tint hover:text-ink">
          <X className="size-4" />
        </button>
      </div>
      <div className="px-3 pb-3 sm:px-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-faint tabular-nums">{formatAudioTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={max}
            step="0.1"
            value={Math.min(currentTime, max)}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="موقعیت پخش"
            dir="ltr"
            className="h-1.5 min-w-0 flex-1 cursor-pointer accent-[var(--brand-deep)]"
            style={{ background: `linear-gradient(to right, var(--brand-deep) ${progress}%, var(--tint-strong) ${progress}%)` }}
          />
          <span className="text-[10px] font-semibold text-faint tabular-nums">{formatAudioTime(max)}</span>
          <Volume2 className="hidden size-3.5 shrink-0 text-faint sm:block" />
          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(Number(e.target.value))} aria-label="بلندی صدا" dir="ltr" className="hidden w-16 accent-[var(--brand-deep)] sm:block" />
        </div>
        {error && <p role="alert" className="mt-2 text-[10px] font-semibold text-danger">{error}</p>}
      </div>
    </aside>
  );
}
