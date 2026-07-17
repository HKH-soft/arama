"use client";

import { useEffect, useState } from "react";

/** Calm rotating phrase — soft blur/fade, no bounce. */
export function RotatingWord({ words, className = "" }: { words: string[]; className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), 2600);
    return () => clearInterval(id);
  }, [words.length]);

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), words[0]);

  return (
    <span className={`word-swap relative inline-block align-baseline ${className}`} aria-live="polite">
      {/* invisible sizer keeps layout stable */}
      <span className="invisible whitespace-nowrap" aria-hidden>
        {longest}
      </span>
      {words.map((w, i) => (
        <span
          key={w}
          className={`swap-word ${className} ${i === index ? "is-active" : ""}`}
          aria-hidden={i !== index}
        >
          {w}
        </span>
      ))}
      <span className="sr-only">{words[index]}</span>
    </span>
  );
}
