"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Timer,
  ArrowLeft,
  SkipBack,
  SkipForward,
  Headphones,
  Clock,
  Sparkles,
  X,
} from "lucide-react";
import { useAudioPlayer, type Track } from "@/hooks/useAudioPlayer";

type BreathPhase = "inhale" | "hold" | "exhale" | "rest";

const PHASE_CONFIG: Record<
  BreathPhase,
  { label: string; duration: number; scale: number; next: BreathPhase }
> = {
  inhale: { label: "نفس بکش", duration: 4, scale: 1.3, next: "hold" },
  hold: { label: "نگه دار", duration: 4, scale: 1.3, next: "exhale" },
  exhale: { label: "بیرون بده", duration: 4, scale: 0.9, next: "rest" },
  rest: { label: "آرام باش", duration: 2, scale: 0.9, next: "inhale" },
};

const TIMER_OPTIONS = [60, 120, 300, 600];
const CATEGORIES = [
  "همه",
  "آرامش",
  "خواب",
  "تنفسی",
  "مثبت‌اندیشی",
  "بدن‌آگاهی",
  "شفقت",
];

export default function MeditationPage() {
  const player = useAudioPlayer();
  const queue = player.queue || [];

  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [zenMode, setZenMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState("همه");

  const [isBreathing, setIsBreathing] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const [elapsed, setElapsed] = useState(0);
  const [timerDuration, setTimerDuration] = useState(300);
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [muted, setMuted] = useState(false);
  const [breathCount, setBreathCount] = useState(0);

  const filteredTracks =
    activeCategory === "همه"
      ? queue
      : queue.filter((t) => t.category === activeCategory);

  const selectMeditation = (track: Track) => {
    if (!track) return;
    setSelectedTrack(track);
    setZenMode(true);
    player.playTrack(track);
    setIsBreathing(true);
    setElapsed(0);
    setBreathCount(0);
    setPhase("inhale");
  };

  const exitZen = () => {
    setZenMode(false);
    setIsBreathing(false);
    player.stop();
    setSelectedTrack(null);
    setBreathCount(0);
    setElapsed(0);
    setPhase("inhale");
  };

  // مدیریت تایمرها و فازهای تنفس به صورت بهینه و هماهنگ
  useEffect(() => {
    if (!isBreathing) return;

    // ۱. هندل کردن فازهای تنفس
    const currentPhaseDuration = PHASE_CONFIG[phase].duration * 1000;
    const phaseTimeout = setTimeout(() => {
      const nextPhase = PHASE_CONFIG[phase].next;
      setPhase(nextPhase);
      if (nextPhase === "inhale") {
        setBreathCount((c) => c + 1);
      }
    }, currentPhaseDuration);

    // ۲. هندل کردن شمارش معکوس کل زمان مدیتیشن (هر یک ثانیه یکبار)
    const secondInterval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (timerDuration > 0 && next >= timerDuration) {
          setIsBreathing(false);
          player.pause();
          return timerDuration;
        }
        return next;
      });
    }, 1000);

    return () => {
      clearTimeout(phaseTimeout);
      clearInterval(secondInterval);
    };
  }, [isBreathing, phase, timerDuration, player.pause]);

  const toggleMute = () => {
    if (muted) {
      player.changeVolume(0.7);
    } else {
      player.changeVolume(0);
    }
    setMuted(!muted);
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const remaining = Math.max(0, timerDuration - elapsed);
  const totalProgress = timerDuration > 0 ? (elapsed / timerDuration) * 100 : 0;
  const currentConfig = PHASE_CONFIG[phase];

  // استایل انیمیشن نرم برای حرکت ارتعاشی دایره تنفس بدون درگیر کردن فریم ری‌اکت
  const orbStyle = {
    transform: `scale(${isBreathing ? currentConfig.scale : 1})`,
    transition: `transform ${isBreathing ? currentConfig.duration : 0.5}s cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  // ════════════════════════════════════════════════════
  // ZEN MODE
  // ════════════════════════════════════════════════════
  if (zenMode && selectedTrack) {
    return (
      <div className="relative h-full flex flex-col overflow-hidden select-none font-vazirmatn">
        <style>{`
          @keyframes zenFloat {
            0% { transform: translateY(0px) translateX(0px); opacity: 0; }
            20% { opacity: 0.25; }
            80% { opacity: 0.25; }
            100% { transform: translateY(-120px) translateX(10px); opacity: 0; }
          }
          .zen-particle {
            animation: zenFloat var(--duration) ease-in-out infinite;
            animation-delay: var(--delay);
          }
        `}</style>

        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-green-900/80 to-emerald-950" />

        {/* Ambient Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-emerald-400/20 zen-particle"
              style={
                {
                  width: `${3 + Math.random() * 5}px`,
                  height: `${3 + Math.random() * 5}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${60 + Math.random() * 30}%`,
                  "--duration": `${8 + Math.random() * 8}s`,
                  "--delay": `${Math.random() * -10}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2">
          <button
            onClick={exitZen}
            className="flex items-center gap-2 text-foreground/50 hover:text-foreground/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span className="text-xs">بستن ذن</span>
          </button>
          <div className="flex items-center gap-3 text-foreground/50 text-xs">
            <span>{breathCount} تنفس</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="inline-block min-w-[35px] tabular-nums" dir="ltr">
              {formatTimer(elapsed)}
            </span>
          </div>
        </div>

        {/* Track info */}
        <div className="relative z-10 text-center pt-2 pb-4">
          <h2 className="text-lg font-bold text-foreground/90">
            {selectedTrack.title}
          </h2>
          <p className="text-xs text-foreground/40 mt-0.5">{selectedTrack.artist}</p>
        </div>

        {/* Breathing orb */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-8">
          <div className="relative flex items-center justify-center">
            {/* Outer Background Glow */}
            <div
              className="absolute rounded-full"
              style={{
                width: "280px",
                height: "280px",
                background:
                  "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
                ...orbStyle,
              }}
            />
            {/* Inner Ring */}
            <div
              className="absolute rounded-full border border-emerald-400/10"
              style={{
                width: "240px",
                height: "240px",
                ...orbStyle,
              }}
            />

            {/* Main Orb Element */}
            <div
              className="relative rounded-full flex items-center justify-center"
              style={{
                width: "180px",
                height: "180px",
                transformOrigin: "center",
                ...orbStyle,
              }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle at 40% 35%, rgba(52,211,153,0.9) 0%, rgba(16,185,129,0.7) 40%, rgba(6,95,70,0.8) 70%, rgba(6,78,59,0.9) 100%)`,
                  boxShadow: `0 0 60px rgba(16,185,129,0.3), 0 0 120px rgba(16,185,129,0.1), inset 0 -20px 40px rgba(0,0,0,0.2)`,
                }}
              />
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="flex items-center gap-6">
                  <div className="w-4 h-[2px] bg-emerald-900/60 rounded-full" />
                  <div className="w-4 h-[2px] bg-emerald-900/60 rounded-full" />
                </div>
                <div className="w-6 h-3 border-b-2 border-emerald-900/40 rounded-b-full" />
              </div>
              <div className="absolute top-[18%] left-[28%] w-8 h-6 bg-white/15 rounded-full blur-md" />
            </div>
          </div>

          {/* Phase label — in flow, below orb */}
          <p className="text-lg font-bold text-foreground/80 tracking-wide whitespace-nowrap transition-all duration-300">
            {isBreathing ? currentConfig.label : "متوقف شده"}
          </p>

          {/* Timer ring */}
          {timerDuration > 0 && isBreathing && (
            <div className="relative">
              <svg width="48" height="48" className="opacity-40">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="rgba(52,211,153,0.6)"
                  strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - totalProgress / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 24 24)"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] text-foreground/50 tabular-nums">
                {formatTimer(remaining)}
              </span>
            </div>
          )}
        </div>

        {/* Timer picker overlay */}
        {showTimerPicker && (
          <div
            className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowTimerPicker(false)}
          >
            <div
              className="bg-black/90 border border-white/10 rounded-2xl p-5 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowTimerPicker(false)}
                className="absolute top-4 left-4 text-foreground/40 hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-sm font-semibold text-foreground mb-4 text-center">
                تنظیم زمان تمرین جاری
              </p>
              <div className="grid grid-cols-2 gap-2">
                {TIMER_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTimerDuration(t);
                      setElapsed(0);
                      setShowTimerPicker(false);
                    }}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      timerDuration === t
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/5 text-foreground/60 hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    {t / 60} دقیقه
                  </button>
                ))}
                <button
                  onClick={() => {
                    setTimerDuration(0);
                    setElapsed(0);
                    setShowTimerPicker(false);
                  }}
                  className={`col-span-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    timerDuration === 0
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/5 text-foreground/60 hover:bg-white/10 border border-transparent"
                  }`}
                >
                  بدن محدودیت زمانی
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Audio progress bar */}
        {player.currentTrack && player.duration > 0 && (
          <div className="relative z-10 px-8 pb-2">
            <div
              className="h-1 bg-white/10 rounded-full cursor-pointer group relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const isRtl =
                  window.getComputedStyle(e.currentTarget).direction === "rtl";
                const pct = isRtl
                  ? (rect.right - e.clientX) / rect.width
                  : (e.clientX - rect.left) / rect.width;
                player.seek(Math.max(0, Math.min(1, pct)) * player.duration);
              }}
            >
              <div
                className="h-full bg-emerald-400/60 group-hover:bg-emerald-400 rounded-full transition-colors absolute top-0 start-0"
                style={{
                  width: `${player.duration ? (player.progress / player.duration) * 100 : 0}%`,
                }}
              />
            </div>
            <div
              className="flex justify-between text-[10px] text-foreground/30 mt-1 tabular-nums"
              dir="ltr"
            >
              <span>{formatTimer(player.progress)}</span>
              <span>{formatTimer(player.duration)}</span>
            </div>
          </div>
        )}

        {/* Bottom controls */}
        <div className="relative z-10 flex items-center justify-center gap-6 px-6 pb-6 pt-2">
          <button
            onClick={toggleMute}
            className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-foreground/50 hover:text-foreground/80 transition-all"
          >
            {muted || player.volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={player.playPrev}
            className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-foreground/50 hover:text-foreground/80 transition-all"
          >
            <SkipBack className="w-4 h-4 rtl:rotate-180" />
          </button>

          <button
            onClick={() => {
              player.togglePlay();
              setIsBreathing(!player.isPlaying);
            }}
            className="w-16 h-16 rounded-2xl bg-white/10 border border-white/[0.12] flex items-center justify-center text-foreground hover:bg-white/[0.15] transition-all backdrop-blur-sm shadow-lg"
          >
            {player.isPlaying ? (
              <Pause className="w-7 h-7 fill-white" />
            ) : (
              <Play className="w-7 h-7 fill-white ml-1" />
            )}
          </button>

          <button
            onClick={player.playNext}
            className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-foreground/50 hover:text-foreground/80 transition-all"
          >
            <SkipForward className="w-4 h-4 rtl:rotate-180" />
          </button>

          <button
            onClick={() => setShowTimerPicker(true)}
            className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-foreground/50 hover:text-foreground/80 transition-all"
            title="تنظیم زمان"
          >
            <Timer className="w-4 h-4" />
          </button>
        </div>

        {/* Timer label */}
        <div className="relative z-10 text-center pb-3">
          <span className="text-[11px] text-foreground/25">
            {timerDuration > 0
              ? `مدت هدف: ${timerDuration / 60} دقیقه`
              : "بدون محدودیت زمانی"}
          </span>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════
  // BROWSE MODE
  // ════════════════════════════════════════════════════
  return (
    <div className="font-vazirmatn min-h-screen bg-card text-foreground pb-12">
      <div className="bg-gradient-to-b from-violet-900/40 via-card to-card px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">مدیتیشن</h1>
        <p className="text-foreground/50 mt-1 text-sm">
          یک مدیتیشن انتخاب کن و در حالت ذِن آرامش پیدا کن
        </p>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {queue.length > 0 && (
          <div className="bg-gradient-to-r from-violet-500/20 via-purple-500/10 to-transparent rounded-xl p-6 border border-violet-500/10">
            <div className="flex items-center gap-2 text-violet-400 text-sm font-medium mb-2">
              <Sparkles className="w-4 h-4" />
              <span>پیشنهاد امروز</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {queue[0].title}
            </h2>
            <p className="text-foreground/50 text-sm mb-4 max-w-lg">
              مدیتیشن هدایت شده برای آرام کردن افکار مزاحم و رسیدن به آرامش
              درونی
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => selectMeditation(queue[0])}
                className="flex items-center gap-2 bg-white text-black font-semibold px-5 py-2.5 rounded-full text-sm hover:scale-105 transition-transform"
              >
                <Play className="w-4 h-4 fill-black me-2" />
                شروع مدیتیشن
              </button>
              <span className="flex items-center gap-1.5 text-foreground/40 text-xs">
                <Clock className="w-3.5 h-3.5" />
                {formatTimer(queue[0].duration)}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-white text-black"
                  : "bg-white/5 text-foreground/70 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTracks.map((track) => {
            const isCurrent = player.currentTrack?.id === track.id;
            return (
              <button
                key={track.id}
                onClick={() => selectMeditation(track)}
                className="bg-gradient-to-br from-emerald-500/15 to-teal-500/5 rounded-xl p-5 border border-white/5 hover:border-emerald-500/20 transition-all group cursor-pointer text-start w-full"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <Headphones className="w-5 h-5 text-foreground/60" />
                  </div>
                  {isCurrent && player.isPlaying && (
                    <div className="flex items-end gap-[2px] h-4">
                      <span className="w-[3px] bg-emerald-400 rounded-full animate-[equalizer_0.8s_ease-in-out_infinite_alternate] h-2" />
                      <span className="w-[3px] bg-emerald-400 rounded-full animate-[equalizer_0.6s_ease-in-out_infinite_alternate_0.2s] h-4" />
                      <span className="w-[3px] bg-emerald-400 rounded-full animate-[equalizer_0.7s_ease-in-out_infinite_alternate_0.4s] h-3" />
                    </div>
                  )}
                </div>
                {track.category && (
                  <span className="text-[11px] text-foreground/40 bg-white/5 px-2 py-0.5 rounded-full">
                    {track.category}
                  </span>
                )}
                <h3 className="text-base font-bold text-foreground mt-2 mb-1">
                  {track.title}
                </h3>
                <p className="text-foreground/50 text-sm mb-4 leading-relaxed">
                  {track.artist}
                </p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-foreground/40 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTimer(track.duration)}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-emerald-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-emerald-500/20">
                    <Play className="w-4 h-4 text-foreground fill-white" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
