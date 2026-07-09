"use client";

import { useState, useRef, type FormEvent, type KeyboardEvent } from "react";
import { Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const SUGGESTED_PROMPTS = [
  "امروز خیلی استرس دارم",
  "احساس تنهایی می‌کنم",
  "برای خواب بهتر کمکم کن",
  "چطور آرام بشم؟",
];

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  return (
    <div className="space-y-3">
      {/* Suggested prompts — only shown when empty */}
      {!value && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setValue(prompt);
                textareaRef.current?.focus();
              }}
              className="text-xs px-3 py-1.5 rounded-full border border-border/8 bg-background/50 hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
              data-testid={`prompt-${prompt}`}
            >
              {prompt}
            </button>
          ))}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        {/* Send button */}
        <Button
          type="submit"
          disabled={!value.trim() || disabled}
          className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground p-0 flex items-center justify-center shrink-0 shadow-md disabled:opacity-40"
          data-testid="button-send"
          aria-label="ارسال پیام"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </Button>

        {/* Textarea */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="احساست رو بنویس..."
            rows={1}
            disabled={disabled}
            className="w-full resize-none bg-background border border-border/8 rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors placeholder:text-muted-foreground disabled:opacity-50 leading-relaxed min-h-[44px] max-h-[140px]"
            data-testid="input-message"
          />
        </div>

        {/* Voice button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary h-11 w-11 shrink-0 rounded-full"
          data-testid="button-voice"
          title="ورودی صوتی (به زودی)"
          aria-label="ضبط صدا"
        >
          <Mic className="w-5 h-5" aria-hidden="true" />
        </Button>
      </form>

      <p className="text-center text-[10px] text-muted-foreground">
        آراما ممکن است اشتباه کند. در بحران‌های جدی با اورژانس اجتماعی ۱۲۳ تماس
        بگیرید.
      </p>
    </div>
  );
}
