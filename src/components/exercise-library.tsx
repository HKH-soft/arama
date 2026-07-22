"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Anchor, Check, Heart, Pause, PenLine, Play, Sparkles, Wind, WifiOff, X } from "lucide-react";
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
        <ExerciseSession
          exercise={activeExercise}
          onClose={() => setActiveExercise(null)}
        />
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
