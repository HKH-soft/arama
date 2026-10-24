"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info, Pause, Play, RotateCcw, Sparkles, Volume2, VolumeX, Wind } from "lucide-react";

type BreathPhase = "idle" | "inhale" | "hold" | "exhale";

const PHASES: Record<BreathPhase, { duration: number; text: string; instruction: string; color: string }> = {
  idle: {
    duration: 0,
    text: "آماده برای آرامش",
    instruction: "یک دقیقه برای تنفس عمیق وقت بگذارید تا تپش قلب و اضطراب فروکش کند.",
    color: "from-brand to-brand-glow",
  },
  inhale: {
    duration: 4,
    text: "دم آرام از بینی",
    instruction: "به‌آرامی هوا را به عمق ریه‌هایتان وارد کنید...",
    color: "from-teal-400 to-emerald-500",
  },
  hold: {
    duration: 7,
    text: "نگه‌داشتن نفس",
    instruction: "هوا را با آرامش در سینه حبس کنید...",
    color: "from-sky-400 to-indigo-500",
  },
  exhale: {
    duration: 8,
    text: "بازدم آرام و پیوسته",
    instruction: "به‌آرامی تمام هوا را از دهان خارج کنید و تنش‌ها را رها کنید...",
    color: "from-amber-400 to-rose-400",
  },
};

export function QuickCalmWidget() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("idle");
  const [countdown, setCountdown] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const maxCycles = 4;

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive) {
      if (countdown > 1) {
        timer = setTimeout(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        // Switch phase
        if (phase === "idle" || phase === "exhale") {
          if (phase === "exhale") {
            if (cycle >= maxCycles) {
              setIsActive(false);
              setPhase("idle");
              setCycle(1);
              return;
            }
            setCycle((c) => c + 1);
          }
          setPhase("inhale");
          setCountdown(PHASES.inhale.duration);
        } else if (phase === "inhale") {
          setPhase("hold");
          setCountdown(PHASES.hold.duration);
        } else if (phase === "hold") {
          setPhase("exhale");
          setCountdown(PHASES.exhale.duration);
        }
      }
    }

    return () => clearTimeout(timer);
  }, [isActive, countdown, phase, cycle]);

  const handleStart = () => {
    setIsActive(true);
    setPhase("inhale");
    setCountdown(PHASES.inhale.duration);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase("idle");
    setCountdown(0);
    setCycle(1);
  };

  const getSphereScale = () => {
    if (phase === "inhale") return "scale-125";
    if (phase === "hold") return "scale-125 animate-pulse";
    if (phase === "exhale") return "scale-90";
    return "scale-100";
  };

  return (
    <section aria-labelledby="calm-widget-title" className="relative mx-auto my-12 max-w-5xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-brand/20 bg-gradient-to-b from-card/90 via-card/60 to-tint/30 p-6 shadow-[var(--shadow-soft)] backdrop-blur-xl sm:p-10 lg:p-12">
        {/* Ambient background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -end-20 -top-20 size-80 rounded-full bg-brand/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -start-20 size-80 rounded-full bg-brand-glow/10 blur-3xl"
        />

        <div className="relative grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Right column (RTL copy) */}
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-tint px-3 py-1 text-xs font-bold text-brand-ink">
              <Sparkles className="size-3.5" />
              تسکین آنی اضطراب با تکنیک ۴-۷-۸
            </span>

            <h2 id="calm-widget-title" className="mt-4 text-2xl font-black text-ink sm:text-3xl lg:text-4xl">
              همین الان یک دقیقه با آراما نفس بکش
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-soft sm:text-base">
              تکنیک علمی تنفس ۴-۷-۸ بر اساس تحقیقات دانشگاه هاروارد، ظرف ۶۰ ثانیه ضربان قلب را کاهش داده، عصب واگ را فعال کرده و سطح کورتیزول (هورمون استرس) را در بدن پایین می‌آورد.
            </p>

            {/* Instruction Banner */}
            <div className="mt-5 w-full rounded-2xl border border-line bg-background/60 p-4 backdrop-blur sm:p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-faint">
                <span className="flex items-center gap-1.5">
                  <Wind className="size-4 text-brand" />
                  {isActive ? `چرخهٔ تنفس ${cycle} از ${maxCycles}` : "تمرین ۶۰ ثانیه‌ای"}
                </span>
                <span className="text-brand-ink font-bold">
                  {phase === "idle" ? "آماده" : phase === "inhale" ? "دم ۴ ثانیه" : phase === "hold" ? "حبس ۷ ثانیه" : "بازدم ۸ ثانیه"}
                </span>
              </div>
              <p className="mt-2 text-sm font-bold text-ink sm:text-base">
                {PHASES[phase].instruction}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {!isActive ? (
                <button
                  type="button"
                  onClick={handleStart}
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-deep px-6 py-3 text-sm font-bold text-onbrand shadow-[var(--shadow-brand)] transition-all duration-300 hover:brightness-110 active:scale-95"
                >
                  <Play className="size-4 fill-current transition-transform group-hover:scale-110" />
                  {phase === "idle" ? "شروع تنفس آرامش‌بخش" : "ادامه تمرین"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-line bg-card px-5 py-3 text-sm font-bold text-ink transition-colors hover:bg-tint active:scale-95"
                >
                  <Pause className="size-4 fill-current" />
                  توقف موقت
                </button>
              )}

              {phase !== "idle" && (
                <button
                  type="button"
                  onClick={handleReset}
                  aria-label="شروع مجدد تمرین"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-card text-soft transition-colors hover:bg-tint hover:text-ink"
                >
                  <RotateCcw className="size-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setSoundEnabled((v) => !v)}
                title={soundEnabled ? "قطع راهنمای صوتی" : "فعال‌سازی راهنمای صوتی"}
                aria-label="تنظیمات صدا"
                className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-card text-soft transition-colors hover:bg-tint hover:text-ink"
              >
                {soundEnabled ? <Volume2 className="size-4 text-brand-ink" /> : <VolumeX className="size-4" />}
              </button>
            </div>
          </div>

          {/* Left column: Visual Breathing Orb */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative flex size-64 items-center justify-center sm:size-72">
              {/* Outer Pulsing Waves */}
              <div
                aria-hidden
                className={`absolute inset-0 rounded-full border-2 border-brand/20 transition-all duration-1000 ${
                  isActive ? "scale-110 opacity-70 animate-ping" : "scale-100 opacity-20"
                }`}
                style={{ animationDuration: "3s" }}
              />
              <div
                aria-hidden
                className={`absolute inset-3 rounded-full border border-brand/30 transition-all duration-700 ${
                  isActive ? "scale-105 opacity-60" : "scale-100 opacity-25"
                }`}
              />

              {/* Main Breathing Core Orb */}
              <div
                className={`flex size-44 items-center justify-center rounded-full bg-gradient-to-tr ${
                  PHASES[phase].color
                } shadow-2xl transition-all duration-[2000ms] ease-in-out sm:size-48 ${getSphereScale()}`}
              >
                <div className="flex flex-col items-center justify-center text-center text-white p-4">
                  <span className="text-xs font-medium tracking-wide drop-shadow opacity-90">
                    {PHASES[phase].text}
                  </span>
                  {isActive && countdown > 0 && (
                    <span className="mt-1 text-3xl font-black drop-shadow-md sm:text-4xl">
                      {countdown}
                    </span>
                  )}
                  {!isActive && (
                    <Wind className="mt-2 size-7 drop-shadow animate-bounce opacity-85" />
                  )}
                </div>
              </div>
            </div>

            {/* Scientific Trust Badge */}
            <div className="mt-4 flex items-center gap-2 rounded-full border border-line bg-background/50 px-3.5 py-1 text-xs text-faint">
              <CheckCircle2 className="size-3.5 text-brand" />
              <span>پروتکل تأیید شدهٔ روان‌شناسی برای کنترل تپش قلب و استرس</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
