"use client";

import { useRef, useCallback, useState, useEffect, type ReactNode } from "react";

interface BorderGlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  colors?: string[];
  fillOpacity?: number;
}

function buildBoxShadow(glowColor: string, intensity: number): string {
  const layers: [number, number, number, number, number, boolean][] = [
    [0, 0, 0, 1, 100, true],
    [0, 0, 1, 0, 60, true],
    [0, 0, 3, 0, 50, true],
    [0, 0, 6, 0, 40, true],
    [0, 0, 15, 0, 30, true],
    [0, 0, 25, 2, 20, true],
    [0, 0, 50, 2, 10, true],
    [0, 0, 1, 0, 60, false],
    [0, 0, 3, 0, 50, false],
    [0, 0, 6, 0, 40, false],
    [0, 0, 15, 0, 30, false],
    [0, 0, 25, 2, 20, false],
    [0, 0, 50, 2, 10, false],
  ];
  return layers
    .map(([x, y, blur, spread, alpha, inset]) => {
      const a = Math.min(alpha * intensity, 100);
      return `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px hsl(${glowColor} / ${a}%)`;
    })
    .join(", ");
}

const GRADIENT_POSITIONS = [
  "80% 55%",
  "69% 34%",
  "8% 6%",
  "41% 38%",
  "86% 85%",
  "82% 18%",
  "51% 4%",
];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildMeshGradients(colors: string[]): string[] {
  const gradients: string[] = [];
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    gradients.push(`radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`);
  }
  gradients.push(`linear-gradient(${colors[0]} 0 100%)`);
  return gradients;
}

export default function BorderGlowCard({
  children,
  className = "",
  glowColor = "195 42% 52%",
  backgroundColor,
  borderRadius = 20,
  glowRadius = 35,
  glowIntensity = 1.0,
  coneSpread = 25,
  colors,
  fillOpacity = 0.5,
}: BorderGlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorAngle, setCursorAngle] = useState(45);
  const [edgeProximity, setEdgeProximity] = useState(0);

  const getCenter = useCallback((el: HTMLElement) => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  }, []);

  const getEdgeProx = useCallback(
    (el: HTMLElement, x: number, y: number) => {
      const [cx, cy] = getCenter(el);
      const dx = x - cx;
      const dy = y - cy;
      let kx = Infinity;
      let ky = Infinity;
      if (dx !== 0) kx = cx / Math.abs(dx);
      if (dy !== 0) ky = cy / Math.abs(dy);
      return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    },
    [getCenter]
  );

  const getAngle = useCallback(
    (el: HTMLElement, x: number, y: number) => {
      const [cx, cy] = getCenter(el);
      const dx = x - cx;
      const dy = y - cy;
      if (dx === 0 && dy === 0) return 0;
      const radians = Math.atan2(dy, dx);
      let degrees = radians * (180 / Math.PI) + 90;
      if (degrees < 0) degrees += 360;
      return degrees;
    },
    [getCenter]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      setEdgeProximity(getEdgeProx(card, e.clientX - rect.left, e.clientY - rect.top));
      setCursorAngle(getAngle(card, e.clientX - rect.left, e.clientY - rect.top));
    },
    [getEdgeProx, getAngle]
  );

  const edgeSensitivity = 30;
  const colorSensitivity = edgeSensitivity + 20;
  const borderOpacity = isHovered
    ? Math.max(0, (edgeProximity * 100 - colorSensitivity) / (100 - colorSensitivity))
    : 0;
  const glowOp = isHovered
    ? Math.max(0, (edgeProximity * 100 - edgeSensitivity) / (100 - edgeSensitivity))
    : 0;

  const meshGradients = buildMeshGradients(
    colors ?? ["hsl(195 42% 52%)", "hsl(170 35% 55%)", "hsl(215 22% 72%)"]
  );
  const borderBg = meshGradients.map((g) => `${g} border-box`);
  const angleDeg = `${cursorAngle.toFixed(3)}deg`;

  const bg = backgroundColor ?? "hsl(var(--card))";

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      className={`relative grid isolate ${className}`}
      style={{
        background: bg,
        borderRadius: `${borderRadius}px`,
        transform: "translate3d(0, 0, 0.01px)",
        boxShadow:
          "rgba(0,0,0,0.06) 0 1px 2px, rgba(0,0,0,0.06) 0 2px 4px, rgba(0,0,0,0.06) 0 4px 8px, rgba(0,0,0,0.06) 0 8px 16px, rgba(0,0,0,0.06) 0 16px 32px",
      }}
    >
      {/* mesh gradient border */}
      <div
        className="absolute inset-0 rounded-[inherit] -z-[1]"
        style={{
          border: "1px solid transparent",
          background: [
            `linear-gradient(${bg} 0 100%) padding-box`,
            "linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box",
            ...borderBg,
          ].join(", "),
          opacity: borderOpacity,
          maskImage: `conic-gradient(from ${angleDeg} at center, black ${coneSpread}%, transparent ${
            coneSpread + 15
          }%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
          WebkitMaskImage: `conic-gradient(from ${angleDeg} at center, black ${coneSpread}%, transparent ${
            coneSpread + 15
          }%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`,
          transition: isHovered ? "opacity 0.25s ease-out" : "opacity 0.75s ease-in-out",
        }}
      />

      {/* mesh gradient fill near edges */}
      <div
        className="absolute inset-0 rounded-[inherit] -z-[1]"
        style={{
          border: "1px solid transparent",
          background: meshGradients.map((g) => `${g} padding-box`).join(", "),
          maskImage: [
            "linear-gradient(to bottom, black, black)",
            "radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)",
            "radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)",
            "radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)",
            "radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)",
            "radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)",
            `conic-gradient(from ${angleDeg} at center, transparent 5%, black 15%, black 85%, transparent 95%)`,
          ].join(", "),
          WebkitMaskImage: [
            "linear-gradient(to bottom, black, black)",
            "radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)",
            "radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)",
            "radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)",
            "radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)",
            "radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)",
            `conic-gradient(from ${angleDeg} at center, transparent 5%, black 15%, black 85%, transparent 95%)`,
          ].join(", "),
          maskComposite: "subtract, add, add, add, add, add",
          WebkitMaskComposite:
            "source-out, source-over, source-over, source-over, source-over, source-over",
          opacity: borderOpacity * fillOpacity,
          mixBlendMode: "soft-light",
          transition: isHovered ? "opacity 0.25s ease-out" : "opacity 0.75s ease-in-out",
        } as React.CSSProperties}
      />

      {/* outer glow — uses box-shadow on the card itself, no overflow */}
      <span
        className="absolute pointer-events-none z-[1] rounded-[inherit] inset-0"
        style={{
          boxShadow: buildBoxShadow(glowColor, glowIntensity * glowOp),
          maskImage: `conic-gradient(from ${angleDeg} at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
          WebkitMaskImage: `conic-gradient(from ${angleDeg} at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`,
          opacity: glowOp,
          mixBlendMode: "plus-lighter",
          transition: isHovered ? "opacity 0.25s ease-out" : "opacity 0.75s ease-in-out",
        } as React.CSSProperties}
      />

      <div className="flex flex-col relative z-[1]">{children}</div>
    </div>
  );
}
