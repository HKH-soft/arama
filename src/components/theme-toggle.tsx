"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    try {
      localStorage.setItem("arama-theme", next ? "dark" : "light");
    } catch {
      /* private mode */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "تغییر به حالت روشن" : "تغییر به حالت تاریک"}
      aria-pressed={dark ?? false}
      className={`relative inline-flex size-10 items-center justify-center rounded-full border border-line bg-card text-soft shadow-[var(--shadow-soft)] transition-all duration-500 hover:border-brand/40 hover:text-brand-ink ${className}`}
    >
      <Sun
        className={`absolute size-[18px] transition-all duration-500 ${
          dark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        }`}
      />
      <Moon
        className={`absolute size-[18px] transition-all duration-500 ${
          dark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
        }`}
      />
    </button>
  );
}
