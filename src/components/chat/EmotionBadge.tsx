"use client";

import { CircleDot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type Emotion = "اضطراب" | "غم" | "استرس" | "تنهایی" | "شادی" | "آرامش" | "امید" | null;

interface EmotionBadgeProps {
  emotion: Emotion;
  confidence: number;
}

const emotionConfig: Record<NonNullable<Emotion>, { color: string; bg: string; border: string }> = {
  اضطراب:  { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  استرس:   { color: "text-red-600 dark:text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30" },
  غم:      { color: "text-blue-600 dark:text-blue-400",  bg: "bg-blue-500/10",   border: "border-blue-500/30" },
  تنهایی: { color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30" },
  شادی:    { color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  آرامش:   { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  امید:    { color: "text-sky-600 dark:text-sky-400",    bg: "bg-sky-500/10",    border: "border-sky-500/30" },
};

export function detectEmotion(text: string): { emotion: Emotion; confidence: number } {
  const lower = text.toLowerCase();
  if (/استرس|فشار|نگران/.test(lower)) return { emotion: "استرس", confidence: 75 };
  if (/اضطراب|ترس|وحشت|دلهره/.test(lower)) return { emotion: "اضطراب", confidence: 72 };
  if (/غم|ناراحت|گریه|دپرس|افسرده/.test(lower)) return { emotion: "غم", confidence: 68 };
  if (/تنها|تنهایی|کسی نیست/.test(lower)) return { emotion: "تنهایی", confidence: 80 };
  if (/خوشحال|شاد|خوشم/.test(lower)) return { emotion: "شادی", confidence: 85 };
  if (/آروم|آرامش|بهتر/.test(lower)) return { emotion: "آرامش", confidence: 70 };
  if (/امید|میشه|بهتر میشه/.test(lower)) return { emotion: "امید", confidence: 65 };
  return { emotion: null, confidence: 0 };
}

export function EmotionBadge({ emotion, confidence }: EmotionBadgeProps) {
  if (!emotion) return null;
  const cfg = emotionConfig[emotion];

  return (
    <AnimatePresence>
      <motion.div
        key={emotion}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border ${cfg.bg} ${cfg.border}`}
        data-testid="emotion-badge"
      >
        <CircleDot className={`w-3 h-3 ${cfg.color}`} />
        <span className={`text-xs font-medium ${cfg.color}`}>
          احساس شناسایی شده: {emotion} {confidence}٪
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
