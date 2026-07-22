"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AmbientTrack } from "@/db/schema";

type AmbientContextValue = {
  track: AmbientTrack | null;
  volume: number;
  setVolume: (volume: number) => void;
  setTrack: (track: AmbientTrack | null) => void;
};

const AmbientContext = createContext<AmbientContextValue | null>(null);

export function AmbientProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [track, setTrackState] = useState<AmbientTrack | null>(null);
  const [volume, setVolumeState] = useState(0.5);

  // Restore track and volume from localStorage on mount (no autoplay)
  useEffect(() => {
    try {
      const savedVolume = Number(localStorage.getItem("arama-ambient-volume"));
      if (Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 1) {
        setVolumeState(savedVolume);
      }
      
      const savedTrack = localStorage.getItem("arama-ambient-track");
      if (savedTrack) {
        const parsed = JSON.parse(savedTrack) as AmbientTrack;
        setTrackState(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (track) {
      if (audio.src !== track.audioUrl) {
        audio.src = track.audioUrl;
        audio.loop = true;
        audio.load();
        // Do NOT autoplay here per requirements
      }
    } else {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
  }, [track]);

  const setVolume = useCallback((next: number) => {
    const value = Math.min(1, Math.max(0, next));
    setVolumeState(value);
    localStorage.setItem("arama-ambient-volume", String(value));
  }, []);

  const setTrack = useCallback((nextTrack: AmbientTrack | null) => {
    setTrackState(nextTrack);
    if (nextTrack) {
      localStorage.setItem("arama-ambient-track", JSON.stringify(nextTrack));
      // When explicitly choosing a new track, we can play it
      const audio = audioRef.current;
      if (audio) {
        audio.src = nextTrack.audioUrl;
        audio.loop = true;
        audio.load();
        audio.play().catch(() => { /* Autoplay blocked */ });
      }
    } else {
      localStorage.removeItem("arama-ambient-track");
      audioRef.current?.pause();
    }
  }, []);

  const value = useMemo<AmbientContextValue>(() => ({
    track,
    volume,
    setVolume,
    setTrack,
  }), [track, volume, setVolume, setTrack]);

  return (
    <AmbientContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="metadata" aria-hidden="true" loop />
      <AmbientMiniPlayer audioRef={audioRef} />
    </AmbientContext.Provider>
  );
}

export function useAmbientPlayer() {
  const value = useContext(AmbientContext);
  if (!value) throw new Error("useAmbientPlayer must be used inside AmbientProvider");
  return value;
}

import { Play, Pause, Volume2, X } from "lucide-react";
import Image from "next/image";

function AmbientMiniPlayer({ audioRef }: { audioRef: React.RefObject<HTMLAudioElement | null> }) {
  const { track, volume, setVolume, setTrack } = useAmbientPlayer();
  // Using local state to track playing status since audio element state can change outside react
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [audioRef]);

  if (!track) return null;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  return (
    <aside className="fixed inset-x-3 bottom-[11rem] z-40 mx-auto max-w-sm overflow-hidden rounded-[1.5rem] border border-line bg-card/95 shadow-[var(--shadow-lift)] backdrop-blur-xl sm:inset-x-4 lg:bottom-24 lg:start-4 lg:end-auto lg:w-72 lg:translate-x-0 rtl:lg:-translate-x-0">
      <div className="flex items-center gap-2.5 px-3 py-3 sm:gap-3 sm:px-4">
        <Image src={track.coverArt} alt="" width={40} height={40} className="size-10 shrink-0 rounded-2xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-extrabold text-ink">{track.title}</p>
          <p className="mt-0.5 text-[10px] text-faint">صدای محیطی</p>
        </div>
        <button type="button" onClick={togglePlay} className="grid size-9 shrink-0 place-items-center rounded-full bg-tint-strong text-brand-ink">
          {isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
        </button>
        <button type="button" onClick={() => setTrack(null)} className="grid size-8 shrink-0 place-items-center rounded-full text-faint hover:bg-tint hover:text-ink">
          <X className="size-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-2 px-3 pb-3 sm:px-4">
        <Volume2 className="size-3.5 shrink-0 text-faint" />
        <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(Number(e.target.value))} dir="ltr" className="h-1.5 min-w-0 flex-1 cursor-pointer accent-[var(--brand-deep)]" />
      </div>
    </aside>
  );
}
