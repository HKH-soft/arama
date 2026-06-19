"use client";

import { useRef, useState, type ReactNode, type MouseEvent } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export default function MagneticButton({
  children,
  className = "",
  glowColor = "hsl(195 42% 52%)",
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLDivElement>(null);
  const [gradient, setGradient] = useState("transparent");

  const handleMouseMove = (e: MouseEvent) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setGradient(
      `radial-gradient(180px circle at ${x}px ${y}px, ${glowColor} / 0.2, transparent 60%)`
    );
  };

  const handleMouseLeave = () => {
    setGradient("transparent");
  };

  return (
    <div
      ref={btnRef}
      className={`relative inline-block rounded-full overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute inset-0 pointer-events-none rounded-full transition-[background] duration-200 ease-out z-0"
        style={{ background: gradient }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
