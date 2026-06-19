"use client";

import dynamic from "next/dynamic";

const Aurora = dynamic(() => import("@/components/Aurora"), { ssr: false });

interface BackgroundRendererProps {
  isDark: boolean;
}

export function BackgroundRenderer({ isDark }: BackgroundRendererProps) {
  return (
    <Aurora
      colorStops={
        isDark
          ? ["#064e3b", "#022c22", "#064e3b"] // Dark Mode: Deep, rich crisp emerald depths
          : ["#b8dbcf", "#10b77f", "#b8dbcf"] // Light Mode: Soft premium warm cream shifts
      }
      amplitude={1.0}
      blend={0.5}
      speed={1.0}
    />
  );
}
