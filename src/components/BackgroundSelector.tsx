"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const Aurora = dynamic(() => import("@/components/Aurora"), { ssr: false });

export function BackgroundRenderer() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const colors = isDark
    ? ["#064e3b", "#022c22", "#064e3b"]
    : ["#b8dbcf", "#c6f0e2", "#b8dbcf"];

  return (
    <Aurora
      colorStops={colors}
      amplitude={1.0}
      blend={0.5}
      speed={1.0}
    />
  );
}
