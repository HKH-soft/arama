"use client";

import { useEffect, useState } from "react";
import { Mic, Plus, SendHorizonal, Wind } from "lucide-react";
import { AramaMark } from "./logo";

/**
 * A living, scripted glimpse of an آراما conversation.
 * Messages arrive gently; the AI pauses — like it's truly listening.
 * Loops softly so the hero always feels alive.
 */

type Step = { kind: "ai" | "user"; at: number; node: "m1" | "m2" | "m3" | "m4" | "m5" | "chips" };

const SCRIPT: Step[] = [
  { kind: "ai", at: 1400, node: "m1" },
  { kind: "user", at: 3800, node: "m2" },
  { kind: "ai", at: 6600, node: "m3" },
  { kind: "user", at: 10200, node: "m4" },
  { kind: "ai", at: 13400, node: "m5" },
  { kind: "ai", at: 15600, node: "chips" },
];

/* typing appears before each AI message */
const TYPING_AT: Record<string, number> = { m1: 150, m3: 4500, m5: 11400 };
const LOOP = 20500;

function useScriptClock() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const timer = setInterval(() => {
      setT((performance.now() - start) % LOOP);
    }, 50);
    return () => clearInterval(timer);
  }, []);
  return t;
}

function Bubble({ tone, children }: { tone: "ai" | "user"; children: React.ReactNode }) {
  return (
    <div
      className={`animate-rise w-fit max-w-[85%] px-4 py-3 text-[13px] leading-6 sm:text-sm sm:leading-7 ${
        tone === "ai"
          ? "self-start rounded-3xl rounded-tr-md bg-tint text-ink"
          : "self-end rounded-3xl rounded-tl-md bg-brand-deep text-onbrand shadow-[var(--shadow-brand)]"
      }`}
    >
      {children}
    </div>
  );
}

export function ChatMockup() {
  const t = useScriptClock();
  const show = (node: string) => SCRIPT.some((s) => s.node === node && t >= s.at);
  const typing = Object.entries(TYPING_AT).some(([node, at]) => t >= at && !show(node));

  return (
    <div className="card-soft relative flex w-full max-w-md flex-col overflow-hidden rounded-[2rem]">
      {/* window header */}
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <AramaMark className="size-10" />
            <span className="absolute -bottom-0.5 -left-0.5 size-3 rounded-full border-2 border-card bg-brand" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-bold text-ink">آراما</p>
            <p className="text-[11px] font-medium text-faint">همراه هوشمند تو · همیشه اینجاست</p>
          </div>
        </div>
        <span className="rounded-full bg-sand-soft px-3 py-1.5 text-[11px] font-semibold text-clay">
          لحن احساسی: آرام
        </span>
      </div>

      {/* messages — mirrored messenger flow: AI on the right, user on the left (RTL-native) */}
      <div className="flex min-h-[380px] flex-col gap-3 px-4 py-5 sm:min-h-[400px]">
        {show("m1") && <Bubble tone="ai">سلام نازنین، خوشحالم که اینجایی. امروز دلت چطوره؟</Bubble>}

        {show("m2") && <Bubble tone="user">سلام… کمی مضطربم. فردا مصاحبهٔ کاری دارم و مغزم آرام نمی‌گیرد.</Bubble>}

        {show("m3") && (
          <Bubble tone="ai">
            کاملاً طبیعی است؛ اضطراب یعنی این قرار برایت مهم است. بیایم با هم دو کار کنیم: اول چند نفس عمیق، بعد
            نگرانی‌هایت را مرتب کنیم تا کوچک‌تر به نظر برسند.
          </Bubble>
        )}

        {show("m4") && <Bubble tone="user">باشه، از کجا شروع کنیم؟</Bubble>}

        {show("m5") && (
          <div className="animate-rise w-fit max-w-[90%] self-start overflow-hidden rounded-3xl rounded-tr-md border border-brand/20 bg-tint">
            <div className="flex items-center gap-2 border-b border-brand/10 px-4 py-2.5">
              <Wind className="size-4 text-brand-ink" />
              <span className="text-xs font-bold text-brand-ink">تمرین تنفس ۴-۷-۸ · دو دقیقه</span>
            </div>
            <div className="flex items-center gap-4 px-4 py-3.5">
              <div
                className="animate-breathe grid size-12 place-items-center rounded-full bg-brand-deep text-[10px] font-bold text-onbrand"
                aria-hidden
              >
                نفس
              </div>
              <p className="text-[13px] leading-6 text-soft">
                دم از بینی · ۴ ثانیه
                <br />
                نگه‌داشتن · ۷ ثانیه · بازدم · ۸ ثانیه
              </p>
            </div>
          </div>
        )}

        {typing && (
          <div className="flex w-fit items-center gap-1.5 self-start rounded-3xl rounded-tr-md bg-tint px-4 py-3.5" aria-label="آراما در حال نوشتن است">
            <span className="typing-dot size-1.5 rounded-full bg-brand-ink" />
            <span className="typing-dot size-1.5 rounded-full bg-brand-ink" />
            <span className="typing-dot size-1.5 rounded-full bg-brand-ink" />
          </div>
        )}

        {show("chips") && !typing && (
          <div className="animate-rise mt-1 flex flex-wrap gap-2 self-start">
            {["شروع تمرین تنفس", "درباره‌اش حرف بزنیم", "بعداً یادآوری کن"].map((c) => (
              <span
                key={c}
                className="rounded-full border border-brand/25 bg-card px-3.5 py-1.5 text-[11px] font-semibold text-brand-ink"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* composer */}
      <div className="flex items-center gap-2 border-t border-line px-4 py-3.5">
        <button type="button" aria-label="افزودن پیوست" className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-soft transition-colors hover:text-brand-ink">
          <Plus className="size-4.5" />
        </button>
        <div className="flex-1 rounded-full bg-tint px-4 py-2.5 text-[13px] text-faint">هرچه در دلت است، اینجا بنویس…</div>
        <button type="button" aria-label="پیام صوتی" className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-soft transition-colors hover:text-brand-ink">
          <Mic className="size-4.5" />
        </button>
        <button type="button" aria-label="ارسال پیام" className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-deep text-onbrand shadow-[var(--shadow-brand)]">
          <SendHorizonal className="size-4.5 -scale-x-100" />
        </button>
      </div>
    </div>
  );
}
