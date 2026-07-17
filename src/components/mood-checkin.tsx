"use client";

import { useState } from "react";
import { Angry, Frown, Laugh, Meh, Smile } from "lucide-react";

const moods = [
  { icon: Laugh, label: "عالی", ring: "hover:border-brand text-brand-ink", active: "border-brand-deep bg-tint-strong scale-110" },
  { icon: Smile, label: "خوب", ring: "hover:border-brand text-brand-ink", active: "border-brand-deep bg-tint-strong scale-110" },
  { icon: Meh, label: "معمولی", ring: "hover:border-sand text-clay", active: "border-clay bg-sand-soft scale-110" },
  { icon: Frown, label: "کسل", ring: "hover:border-sand text-clay", active: "border-clay bg-sand-soft scale-110" },
  { icon: Angry, label: "سخت", ring: "hover:border-danger text-danger", active: "border-danger bg-danger/10 scale-110" },
];

const replies = [
  "چه عالی! این حس خوب را جایی برای خودت یادداشت کن.",
  "خوب که هستی؛ همین قدمِ اومدن اینجا ارزشمنده.",
  "روزهای معمولی هم بخشی از مسیرند. کنارتم.",
  "می‌شنومش. بیایم در یک گفتگوی کوتاه بارش را سبک‌تر کنیم.",
  "دلم می‌خواهد همین حالا کنارت باشم. بیا نفس عمیق بکشیم.",
];

export function MoodCheckin() {
  const [picked, setPicked] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const chooseMood = async (index: number) => {
    setPicked(index);
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mood: [9, 7, 5, 3, 1][index] }),
      });
      if (!response.ok) throw new Error("ثبت حال انجام نشد؛ دوباره امتحان کن.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت حال انجام نشد؛ دوباره امتحان کن.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div role="radiogroup" aria-label="ثبت خلق امروز" className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {moods.map((m, i) => (
            <button
              key={m.label}
              type="button"
              role="radio"
              aria-checked={picked === i}
              aria-label={`حس امروز: ${m.label}`}
              onClick={() => void chooseMood(i)}
              disabled={saving}
              className={`grid size-11 place-items-center rounded-2xl border bg-card transition-all duration-400 sm:size-13 ${
                picked === i ? m.active : `border-line ${m.ring}`
              }`}
            >
              <m.icon className="size-5 sm:size-6" strokeWidth={1.8} />
            </button>
          ))}
        </div>
        <p className="text-sm leading-7 text-soft" aria-live="polite">
          {saving ? (
            <span className="inline-flex items-center gap-2 font-semibold text-brand-ink"><span className="animate-breathe size-2 rounded-full bg-brand" />در حال ثبت حال امروز…</span>
          ) : error ? (
            <span role="alert" className="font-semibold text-danger">{error}</span>
          ) : picked === null ? (
            <span className="text-faint">بدون هیچ قضاوتی — فقط برای خودت.</span>
          ) : (
            <span className="animate-rise inline-block font-semibold text-brand-ink">{replies[picked]}</span>
          )}
        </p>
      </div>
    </div>
  );
}
