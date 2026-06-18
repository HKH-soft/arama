"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
} from "lucide-react";
import type { Track } from "@/hooks/useAudioPlayer";

function formatTime(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (t: number) => void;
  onVolumeChange: (v: number) => void;
}

export function PlayerBar({
  currentTrack,
  isPlaying,
  progress,
  duration,
  volume,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
}: PlayerBarProps) {
  const progressPct = duration ? (progress / duration) * 100 : 0;

  return (
    <div dir="rtl" className="h-[88px] bg-[#181818] border-t border-white/5 px-4 flex items-center justify-between gap-4 shrink-0">
      {/* Track info */}
      <div className="flex items-center gap-3 w-[280px] min-w-0">
        {currentTrack ? (
          <>
            <div className="w-14 h-14 rounded-md bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center shrink-0">
              <Music className="w-6 h-6 text-white/70" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentTrack.title}
              </p>
              <p className="text-xs text-white/50 truncate">
                {currentTrack.artist}
              </p>
            </div>
          </>
        ) : (
          <div className="text-white/30 text-sm">آهنگی در حال پخش نیست</div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-1 flex-1 max-w-[600px]">
        <div className="flex items-center gap-4">
          <button
            onClick={onPrev}
            className="text-white/60 hover:text-white transition-colors"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button
            onClick={onTogglePlay}
            disabled={!currentTrack}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-40"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-black fill-black" />
            ) : (
              <Play className="w-4 h-4 text-black fill-black mr-0.5" />
            )}
          </button>
          <button
            onClick={onNext}
            className="text-white/60 hover:text-white transition-colors"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-[11px] text-white/50 w-10 text-right tabular-nums">
            {formatTime(progress)}
          </span>
          <div
            className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer group relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const isRtl = document.documentElement.dir === "rtl";
              const pct = isRtl
                ? (rect.right - e.clientX) / rect.width
                : (e.clientX - rect.left) / rect.width;
              onSeek(Math.max(0, Math.min(1, pct)) * duration);
            }}
          >
            <div
              className="h-full bg-white group-hover:bg-primary rounded-full relative transition-colors rtl:ml-auto ltr:mr-auto"
              style={{ width: `${progressPct}%` }}
            >
              <div className="absolute rtl:right-0 ltr:left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="text-[11px] text-white/50 w-10 text-left tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 w-[180px] justify-end">
        <button
          onClick={() => onVolumeChange(volume > 0 ? 0 : 0.7)}
          className="text-white/60 hover:text-white transition-colors"
        >
          {volume === 0 ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        <div
          className="w-24 h-1 bg-white/10 rounded-full cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const isRtl = document.documentElement.dir === "rtl";
            const pct = isRtl
              ? (rect.right - e.clientX) / rect.width
              : (e.clientX - rect.left) / rect.width;
            onVolumeChange(Math.max(0, Math.min(1, pct)));
          }}
        >
          <div
            className="h-full bg-white group-hover:bg-primary rounded-full transition-colors rtl:ml-auto ltr:mr-auto"
            style={{ width: `${volume * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
