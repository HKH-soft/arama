"use client";

import { CircleDot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type Emotion = "اضطراب" | "غم" | "استرس" | "تنهایی" | "شادی" | "آرامش" | "امید" | null;

interface EmotionBadgeProps {
  emotion: Emotion;
  confidence: number;
}

const emotionConfig: Record<NonNullable<Emotion>, { colorVar: string; bgVar: string; borderVar: string }> = {
  اضطراب: { colorVar: "var(--emotion-anxiety)", bgVar: "var(--emotion-anxiety)", borderVar: "var(--emotion-anxiety)" },
  استرس: { colorVar: "var(--emotion-stress)", bgVar: "var(--emotion-stress)", borderVar: "var(--emotion-stress)" },
  غم: { colorVar: "var(--emotion-sadness)", bgVar: "var(--emotion-sadness)", borderVar: "var(--emotion-sadness)" },
  تنهایی: { colorVar: "var(--emotion-loneliness)", bgVar: "var(--emotion-loneliness)", borderVar: "var(--emotion-loneliness)" },
  شادی: { colorVar: "var(--emotion-joy)", bgVar: "var(--emotion-joy)", borderVar: "var(--emotion-joy)" },
  آرامش: { colorVar: "var(--emotion-calmness)", bgVar: "var(--emotion-calmness)", borderVar: "var(--emotion-calmness)" },
  امید: { colorVar: "var(--emotion-hope)", bgVar: "var(--emotion-hope)", borderVar: "var(--emotion-hope)" },
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
        className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border"
        data-testid="emotion-badge"
        style={{
          color: `hsl(${cfg.colorVar})`,
          backgroundColor: `hsl(${cfg.bgVar} / 0.1)`,
          borderColor: `hsl(${cfg.borderVar} / 0.3)`,
        }}
      >
        <CircleDot className="w-3 h-3" style={{ color: `hsl(${cfg.colorVar})` }} />
        <span className="text-xs font-medium" style={{ color: `hsl(${cfg.colorVar})` }}>
          احساس شناسایی شده: {emotion} {confidence}٪
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
