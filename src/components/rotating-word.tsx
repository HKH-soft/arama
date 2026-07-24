"use client";

import { useEffect, useState } from "react";

/** Calm rotating phrase — soft blur/fade, no bounce. */
export function RotatingWord({ words, className = "" }: { words: string[]; className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), 2600);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <span className={`inline-grid align-baseline ${className}`} aria-live="polite">
      {words.map((w, i) => (
        <span
          key={w}
          className={`col-start-1 row-start-1 transition-all duration-700 ease-out ${
            i === index
              ? "opacity-100 translate-y-0 blur-none"
              : "opacity-0 translate-y-[0.4em] blur-[6px] pointer-events-none"
          }`}
          aria-hidden={i !== index}
        >
          {w}
        </span>
      ))}
      {/* For screen readers, only announce the active word */}
      <span className="sr-only">{words[index]}</span>
    </span>
  );
}
