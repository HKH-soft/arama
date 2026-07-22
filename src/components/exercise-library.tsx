"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Anchor, Check, Heart, Pause, PenLine, Play, Sparkles, Wind, WifiOff, X, Plus, Minus } from "lucide-react";
import type { Exercise } from "@/db/schema";

const iconMap = {
  anchor: Anchor,
  pen: PenLine,
  wind: Wind,
  heart: Heart,
  pause: Pause,
  sparkles: Sparkles,
};

function ExerciseIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name as keyof typeof iconMap] ?? Sparkles;
  return <Icon className={className ?? "size-6"} strokeWidth={1.8} />;
}

function formatMins(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toLocaleString("fa-IR", { minimumIntegerDigits: 2 })}:${s.toLocaleString("fa-IR", { minimumIntegerDigits: 2 })}`;
}

/* ── Guided Timer Session ── */
function ExerciseSession({
  exercise,
  onClose,
}: {
  exercise: Exercise;
  onClose: () => void;
}) {
  const totalSeconds = exercise.durationMinutes * 60;
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && !done) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= totalSeconds) {
            setDone(true);
            setRunning(false);
            return totalSeconds;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, done, totalSeconds]);

  // Post completion to server when exercise finishes
  const submittedRef = useRef(false);
  useEffect(() => {
    if (done && !submittedRef.current) {
      submittedRef.current = true;
      fetch("/api/exercises/completions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ exerciseId: exercise.id, durationSeconds: elapsed }),
      }).catch(() => {});
    }
  }, [done, exercise.id, elapsed]);

  const remaining = Math.max(0, totalSeconds - elapsed);
  const progress = totalSeconds > 0 ? (elapsed / totalSeconds) * 100 : 0;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/30 backdrop-blur-sm">
      <div className="card-soft mx-4 w-full max-w-md rounded-[2rem] p-8 text-center">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-sand-soft px-3 py-1.5 text-[10px] font-bold text-clay">
            {exercise.category}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن تمرین"
            className="grid size-9 place-items-center rounded-full text-faint hover:bg-tint hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mx-auto mt-6 flex items-center justify-center">
          <div className="relative grid size-48 place-items-center">
            <svg viewBox="0 0 200 200" className="absolute inset-0 -rotate-90">
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="var(--tint-strong)"
                strokeWidth="10"
              />
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={done ? "var(--clay)" : "var(--brand-deep)"}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-[stroke-dashoffset] duration-1000 ease-linear"
              />
            </svg>
            <div className="relative z-10 text-center">
              {done ? (
                <div>
                  <Check className="mx-auto size-8 text-brand" />
                  <p className="mt-2 text-sm font-extrabold text-ink">آفرین!</p>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-black tabular-nums text-ink">
                    {formatMins(remaining)}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-faint">باقی‌مانده</p>
                </>
              )}
            </div>
          </div>
        </div>

        <h2 className="mt-6 text-lg font-extrabold text-ink">{exercise.title}</h2>
        <p className="mt-2 text-sm leading-7 text-soft">{exercise.description}</p>

        <div className="mt-6 flex items-center justify-center gap-3">
          {!done && (
            <button
              type="button"
              onClick={() => setRunning((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full bg-brand-deep px-6 py-3 text-sm font-bold text-onbrand shadow-[var(--shadow-brand)] transition-all duration-300 hover:scale-105"
            >
              {running ? (
                <>
                  <Pause className="size-4 fill-current" />
                  مکث
                </>
              ) : (
                <>
                  <Play className="size-4 fill-current" />
                  ادامه
                </>
              )}
            </button>
          )}
          {done && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-full bg-brand-deep px-6 py-3 text-sm font-bold text-onbrand shadow-[var(--shadow-brand)]"
            >
              <Check className="size-4" />
              عالی بود، برگردیم
            </button>
          )}
        </div>

        <div className="mt-5 flex items-center justify-center gap-4 text-[11px] font-bold text-faint">
          <span>مدت: {exercise.durationMinutes.toLocaleString("fa-IR")} دقیقه</span>
          <span>سطح: {exercise.difficulty}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Breathing Exercise Session (Advanced UI) ── */
const BREATHING_LABELS = ["دم", "حبس", "بازدم", "حبس"];

function getBreathingPattern(title: string) {
  if (title.includes("۴-۷-۸")) return [4, 7, 8, 0];
  if (title.includes("جعبه‌ای")) return [4, 4, 4, 4];
  return [6, 3, 6, 3];
}

function BreathingSession({
  exercise,
  onClose,
}: {
  exercise: Exercise;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"setup" | "active" | "done">("setup");
  const pattern = getBreathingPattern(exercise.title);
  const cycleSeconds = pattern.reduce((a, b) => a + b, 0);

  const [cycles, setCycles] = useState(10);

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [running, setRunning] = useState(false);

  // When starting or resuming
  const handleStart = () => {
    setStep("active");
    if (!running && phaseSecondsLeft === 0) {
      setCurrentPhaseIndex(0);
      setPhaseSecondsLeft(pattern[0]);
      setCompletedCycles(0);
    }
    setRunning(true);
  };

  useEffect(() => {
    if (step !== "active" || !running) return;
    const interval = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        
        let nextIndex = currentPhaseIndex + 1;
        let nextCycles = completedCycles;

        while (nextIndex < 4 && pattern[nextIndex] === 0) {
          nextIndex++;
        }

        if (nextIndex >= 4) {
          nextCycles++;
          if (nextCycles >= cycles) {
            setStep("done");
            setRunning(false);
            return 0;
          }
          nextIndex = 0;
          while (nextIndex < 4 && pattern[nextIndex] === 0) nextIndex++;
        }

        setCurrentPhaseIndex(nextIndex);
        setCompletedCycles(nextCycles);
        return pattern[nextIndex];
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, running, currentPhaseIndex, completedCycles, cycles, pattern]);

  // Post completion
  const submittedRef = useRef(false);
  useEffect(() => {
    if (step === "done" && !submittedRef.current) {
      submittedRef.current = true;
      fetch("/api/exercises/completions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ exerciseId: exercise.id, durationSeconds: cycles * cycleSeconds }),
      }).catch(() => {});
    }
  }, [step, exercise.id, cycles, cycleSeconds]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/30 backdrop-blur-sm sm:p-4">
      <div className="relative flex w-full max-w-md h-[100svh] sm:h-[85vh] sm:max-h-[850px] flex-col overflow-hidden bg-brand/5 sm:rounded-[2.5rem] shadow-2xl border border-brand/10">
        {/* BG Layer */}
        <div className="absolute inset-0 bg-canvas z-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent z-0" />

        <div className="relative z-10 flex h-full flex-col overflow-y-auto no-scrollbar">
          
          {step === "setup" && (
            <div className="flex-1 flex flex-col p-4 sm:p-6 pb-24">
              {/* Header */}
              <div className="relative h-48 sm:h-56 w-full rounded-[2rem] overflow-hidden mb-6 shrink-0 shadow-md">
                <img
                  src={exercise.iconName === "wind" ? "/images/meditation/breath-guide.jpg" : "/images/meditation/forest-ambience.jpg"}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="Background"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <button
                  onClick={onClose}
                  className="absolute top-4 left-4 grid size-10 place-items-center rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-colors"
                >
                  <X className="size-5" />
                </button>
                <div className="absolute bottom-5 right-5 text-white">
                  <span className="inline-block bg-white/20 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md mb-2">
                    پیش‌فرض
                  </span>
                  <h2 className="text-2xl font-black text-white">{exercise.title}</h2>
                  <p className="text-xs font-medium text-white/80 mt-1">
                    هر چرخه {cycleSeconds} ثانیه
                  </p>
                </div>
              </div>

              {/* Pattern */}
              <div className="bg-card/80 backdrop-blur-xl rounded-[2rem] p-6 mb-4 border border-line shadow-sm shrink-0">
                <p className="text-[11px] font-extrabold text-brand-ink mb-6 text-right">
                  الگوی تنفس
                </p>
                <div className="relative flex justify-between items-center px-2 sm:px-6">
                  <div className="absolute left-6 right-6 top-5 h-0.5 bg-brand/10" />
                  {pattern.map((time, idx) => {
                    if (time === 0) return null;
                    return (
                      <div key={idx} className="relative flex flex-col items-center gap-3 z-10">
                        <div className="w-10 h-10 rounded-full bg-white text-brand-ink text-sm font-black flex items-center justify-center shadow-md border border-brand/5">
                          {time}
                        </div>
                        <span className="text-[10px] font-bold text-soft">
                          {BREATHING_LABELS[idx]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cycles */}
              <div className="bg-card/80 backdrop-blur-xl rounded-[2rem] p-6 pb-8 flex flex-col items-center border border-line shadow-sm relative shrink-0">
                <div className="absolute top-5 right-6 text-right">
                  <p className="text-sm font-extrabold text-ink">تعداد تکرار</p>
                  <p className="text-[10px] font-bold text-soft mt-1">چند چرخه کامل انجام بدی؟</p>
                </div>
                <div className="absolute top-5 left-6">
                  <div className="bg-brand-deep/10 text-brand-ink px-3 py-1.5 rounded-full text-[11px] font-extrabold">
                    ≈ {Math.ceil((cycles * cycleSeconds) / 60)} دقیقه
                  </div>
                </div>

                <div className="flex items-center gap-8 mt-24">
                  <button
                    onClick={() => setCycles(Math.max(1, cycles - 1))}
                    className="w-12 h-12 rounded-full bg-sand hover:bg-sand-soft text-brand-ink flex items-center justify-center shadow-sm transition-transform active:scale-95"
                  >
                    <Minus className="size-5" />
                  </button>

                  <div className="relative size-32 flex items-center justify-center">
                    <svg className="absolute inset-0 size-full -rotate-90">
                      <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8" className="text-brand/10" />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={351.8}
                        strokeDashoffset={351.8 * (1 - cycles / 30)}
                        className="text-brand-deep transition-all duration-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="text-center mt-1">
                      <span className="text-4xl font-black text-brand-ink tabular-nums">{cycles}</span>
                      <p className="text-[11px] font-bold text-brand mt-1">چرخه</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setCycles(Math.min(30, cycles + 1))}
                    className="w-12 h-12 rounded-full bg-sand hover:bg-sand-soft text-brand-ink flex items-center justify-center shadow-sm transition-transform active:scale-95"
                  >
                    <Plus className="size-5" />
                  </button>
                </div>

                <div className="flex flex-wrap justify-center gap-2 mt-8">
                  {[5, 10, 15, 20, 30].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCycles(c)}
                      className={`px-4 py-2 rounded-full text-[11px] font-extrabold transition-all duration-300 ${
                        cycles === c
                          ? "bg-brand-deep text-onbrand shadow-md scale-105"
                          : "bg-sand-soft/50 text-clay hover:bg-sand-soft hover:text-ink"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "active" && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-brand-deep/5">
              <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
                <span className="text-[11px] font-extrabold text-brand-ink bg-card px-4 py-2 rounded-full border border-brand/10 shadow-sm backdrop-blur-md">
                  چرخه {completedCycles + 1} از {cycles}
                </span>
                <button
                  onClick={() => { setRunning(false); setStep("setup"); }}
                  className="w-10 h-10 bg-card/80 backdrop-blur-md rounded-full flex items-center justify-center text-soft hover:text-ink shadow-sm border border-line transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="relative size-72 sm:size-80 flex items-center justify-center mb-16">
                {/* Expanding background glow */}
                <div
                  className="absolute bg-brand/20 rounded-full blur-2xl transition-all"
                  style={{
                    width: BREATHING_LABELS[currentPhaseIndex] === "دم" ? "120%" : (BREATHING_LABELS[currentPhaseIndex] === "حبس" && currentPhaseIndex === 1 ? "120%" : "60%"),
                    height: BREATHING_LABELS[currentPhaseIndex] === "دم" ? "120%" : (BREATHING_LABELS[currentPhaseIndex] === "حبس" && currentPhaseIndex === 1 ? "120%" : "60%"),
                    transitionDuration: `${pattern[currentPhaseIndex]}s`,
                    transitionTimingFunction: "ease-in-out"
                  }}
                />
                
                {/* Main breathing circle */}
                <div
                  className="absolute bg-brand-deep rounded-full shadow-[0_0_60px_var(--brand)] transition-all flex items-center justify-center overflow-hidden z-10"
                  style={{
                    width: BREATHING_LABELS[currentPhaseIndex] === "دم" ? "90%" : (BREATHING_LABELS[currentPhaseIndex] === "حبس" && currentPhaseIndex === 1 ? "90%" : "45%"),
                    height: BREATHING_LABELS[currentPhaseIndex] === "دم" ? "90%" : (BREATHING_LABELS[currentPhaseIndex] === "حبس" && currentPhaseIndex === 1 ? "90%" : "45%"),
                    transitionDuration: `${pattern[currentPhaseIndex]}s`,
                    transitionTimingFunction: "ease-in-out"
                  }}
                >
                   <div className="absolute inset-0 bg-[url('/images/meditation/breath-guide.jpg')] bg-cover opacity-30 mix-blend-overlay" />
                   <div className="relative text-white text-center z-20">
                     <p className="text-6xl sm:text-7xl font-black tabular-nums tracking-tight">{phaseSecondsLeft}</p>
                     <p className="text-sm font-extrabold opacity-90 mt-2">{BREATHING_LABELS[currentPhaseIndex]}</p>
                   </div>
                </div>
              </div>

              <button
                onClick={() => setRunning(!running)}
                className="w-16 h-16 bg-card border border-brand/10 shadow-[var(--shadow-lift)] rounded-full flex items-center justify-center text-brand-ink hover:scale-105 transition-transform z-20"
              >
                {running ? <Pause className="size-6 fill-current" /> : <Play className="size-6 fill-current ml-1" />}
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-brand-deep/5 text-center">
              <div className="size-24 rounded-full bg-brand-deep text-onbrand flex items-center justify-center shadow-[0_0_40px_var(--brand)] mb-8 animate-rise">
                <Check className="size-10 stroke-[3]" />
              </div>
              <h2 className="text-2xl font-black text-ink">تمرین کامل شد!</h2>
              <p className="text-sm font-medium text-soft mt-3 mb-10 max-w-[250px] leading-relaxed">
                آفرین! {cycles} چرخه تنفس عمیق را با موفقیت پشت سر گذاشتی.
              </p>
              <button
                onClick={onClose}
                className="w-full max-w-[200px] bg-brand-deep text-onbrand py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform"
              >
                بازگشت به تمرین‌ها
              </button>
            </div>
          )}

          {/* Fixed Start Button for Setup */}
          {step === "setup" && (
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-canvas via-canvas/90 to-transparent">
              <button
                onClick={handleStart}
                className="w-full bg-brand-deep py-4 rounded-2xl flex items-center justify-center gap-2 text-onbrand font-black text-base shadow-[var(--shadow-brand)] hover:scale-[1.02] hover:bg-brand transition-all duration-300"
              >
                شروع تمرین تنفسی
                <Play className="size-5 fill-current" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Exercise Library ── */
export function ExerciseLibrary() {
  const [items, setItems] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<string[]>(["همه"]);
  const [category, setCategory] = useState("همه");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/exercises", { cache: "no-store" });
      const data = (await response.json()) as {
        exercises?: Exercise[];
        categories?: string[];
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "تمرین‌ها بارگذاری نشدند.");
      setItems(data.exercises ?? []);
      setCategories(data.categories ?? ["همه"]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تمرین‌ها بارگذاری نشدند.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered =
    category === "همه" ? items : items.filter((item) => item.category === category);

  return (
    <div>
      {activeExercise && (
        activeExercise.category === "تنفس" ? (
          <BreathingSession
            exercise={activeExercise}
            onClose={() => setActiveExercise(null)}
          />
        ) : (
          <ExerciseSession
            exercise={activeExercise}
            onClose={() => setActiveExercise(null)}
          />
        )
      )}

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`shrink-0 rounded-full px-4 py-2.5 text-[13px] font-bold transition-all duration-300 ${
              category === item
                ? "bg-brand-deep text-onbrand shadow-sm"
                : "bg-sand-soft/50 text-clay hover:bg-sand-soft hover:text-ink"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-7" aria-live="polite">
        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="card-soft h-56 rounded-[1.75rem] p-6">
                <div className="calm-skeleton size-13 rounded-2xl" />
                <div className="calm-skeleton mt-5 h-5 w-3/4 rounded-full" />
                <div className="calm-skeleton mt-4 h-3 w-full rounded-full" />
                <div className="calm-skeleton mt-2 h-3 w-1/2 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="card-soft rounded-[1.75rem] p-12 text-center">
            <WifiOff className="mx-auto size-8 text-danger" />
            <p className="mt-4 text-sm font-bold text-ink">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-5 rounded-full bg-brand-deep px-5 py-2.5 text-xs font-bold text-onbrand"
            >
              دوباره تلاش کن
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="card-soft rounded-[1.75rem] p-12 text-center">
            <Sparkles className="mx-auto size-9 text-faint" />
            <p className="mt-4 text-sm font-extrabold text-ink">
              هنوز تمرینی در این دسته نیست
            </p>
            <p className="mt-2 text-xs text-soft">دستهٔ دیگری را امتحان کن.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const isShort = item.durationMinutes < 5;
              return (
                <article
                  key={item.id}
                  className={`group relative flex min-h-56 flex-col overflow-hidden p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] ${
                    isShort
                      ? "card-soft rounded-[2.5rem]"
                      : "bg-card/90 backdrop-blur-sm border border-sand/30 shadow-md rounded-[1.75rem]"
                  }`}
                >
                  {!isShort && (
                    <div className="absolute top-0 right-0 w-40 h-40 bg-sand/20 blur-[2rem] rounded-full -mr-20 -mt-20 pointer-events-none transition-transform duration-1000 group-hover:scale-125" />
                  )}
                  
                  <div className="relative flex items-start justify-between gap-3">
                    <span className={`grid size-13 place-items-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                      isShort
                        ? "rounded-full bg-sand-soft text-clay"
                        : "rounded-2xl bg-tint-strong text-brand-ink"
                    }`}>
                      <ExerciseIcon name={item.iconName} />
                    </span>
                    <span className="shrink-0 rounded-full bg-sand-soft/70 px-2.5 py-1 text-[10px] font-bold text-clay">
                      {item.category}
                    </span>
                  </div>
                  
                  <h3 className="relative mt-5 text-base font-extrabold text-ink">
                    {item.title}
                  </h3>
                  <p className="relative mt-2 flex-1 text-[13px] leading-7 text-soft">
                    {item.description}
                  </p>
                  
                  <div className="relative mt-8 flex items-center justify-between border-t border-line/60 pt-5 text-[11px] font-bold">
                    <div className="flex items-center gap-2">
                      <span className="text-soft">
                        {item.durationMinutes.toLocaleString("fa-IR")} دقیقه
                      </span>
                      <span className="rounded-md bg-sand-soft/80 px-1.5 py-0.5 text-clay">
                        {item.difficulty}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveExercise(item)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand-deep px-3.5 py-1.5 text-[11px] font-bold text-onbrand shadow-[var(--shadow-brand)] transition-all duration-300 hover:scale-105"
                    >
                      <Play className="size-3 fill-current" />
                      شروع تمرین
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
