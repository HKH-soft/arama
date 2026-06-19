"use client";

import { useRef, useEffect, useCallback, type ReactNode, type CSSProperties } from "react";
import { gsap } from "gsap";

export interface BentoCardData {
  title: string;
  description: string;
  label: string;
  icon?: ReactNode;
  color?: string;
}

export interface MagicBentoProps {
  cards: BentoCardData[];
  glowColor?: string;
  enableTilt?: boolean;
  enableSpotlight?: boolean;
  spotlightRadius?: number;
  className?: string;
}

const DEFAULT_GLOW = "95, 165, 145";
const DEFAULT_SPOTLIGHT_RADIUS = 300;

const updateCardGlow = (
  card: HTMLElement,
  mx: number,
  my: number,
  glow: number,
  radius: number
) => {
  const rect = card.getBoundingClientRect();
  card.style.setProperty("--glow-x", `${((mx - rect.left) / rect.width) * 100}%`);
  card.style.setProperty("--glow-y", `${((my - rect.top) / rect.height) * 100}%`);
  card.style.setProperty("--glow-intensity", glow.toString());
  card.style.setProperty("--glow-radius", `${radius}px`);
};

function Spotlight({
  gridRef,
  radius,
  glowColor,
}: {
  gridRef: React.RefObject<HTMLDivElement | null>;
  radius: number;
  glowColor: string;
}) {
  const spotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const el = document.createElement("div");
    el.style.cssText = `position:fixed;width:800px;height:800px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(${glowColor},0.12) 0%,rgba(${glowColor},0.06) 15%,rgba(${glowColor},0.02) 40%,transparent 70%);z-index:200;opacity:0;transform:translate(-50%,-50%);mix-blend-mode:screen;`;
    document.body.appendChild(el);
    spotRef.current = el;

    const onMove = (e: MouseEvent) => {
      if (!spotRef.current || !gridRef.current) return;
      const section = gridRef.current.closest(".bento-section");
      const rect = section?.getBoundingClientRect();
      const inside =
        rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

      const cards = gridRef.current.querySelectorAll(".bento-card");
      if (!inside) {
        gsap.to(spotRef.current, { opacity: 0, duration: 0.3 });
        cards.forEach((c) => (c as HTMLElement).style.setProperty("--glow-intensity", "0"));
        return;
      }

      const proximity = radius * 0.5;
      const fade = radius * 0.75;
      let minD = Infinity;

      cards.forEach((card) => {
        const cEl = card as HTMLElement;
        const cr = cEl.getBoundingClientRect();
        const cx = cr.left + cr.width / 2;
        const cy = cr.top + cr.height / 2;
        const d = Math.max(0, Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(cr.width, cr.height) / 2);
        minD = Math.min(minD, d);
        let g = 0;
        if (d <= proximity) g = 1;
        else if (d <= fade) g = (fade - d) / (fade - proximity);
        updateCardGlow(cEl, e.clientX, e.clientY, g, radius);
      });

      gsap.to(spotRef.current, { left: e.clientX, top: e.clientY, duration: 0.1, ease: "power2.out" });
      const targetOp = minD <= proximity ? 0.8 : minD <= fade ? ((fade - minD) / (fade - proximity)) * 0.8 : 0;
      gsap.to(spotRef.current, { opacity: targetOp, duration: targetOp > 0 ? 0.2 : 0.5 });
    };

    const onLeave = () => {
      gridRef.current?.querySelectorAll(".bento-card").forEach((c) =>
        (c as HTMLElement).style.setProperty("--glow-intensity", "0")
      );
      if (spotRef.current) gsap.to(spotRef.current, { opacity: 0, duration: 0.3 });
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      spotRef.current?.parentNode?.removeChild(spotRef.current);
    };
  }, [gridRef, radius, glowColor]);

  return null;
}

function BentoCard({
  card,
  glowColor,
  enableTilt,
  enableBorderGlow,
  children,
}: {
  card: BentoCardData;
  glowColor: string;
  enableTilt: boolean;
  enableBorderGlow: boolean;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (enableTilt) {
        gsap.to(ref.current, {
          rotateX: ((y - rect.height / 2) / (rect.height / 2)) * -8,
          rotateY: ((x - rect.width / 2) / (rect.width / 2)) * 8,
          duration: 0.15,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
    },
    [enableTilt]
  );

  const onLeave = useCallback(() => {
    if (!ref.current) return;
    if (enableTilt) {
      gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [enableTilt]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [onMove, onLeave]);

  const cls = `bento-card flex flex-col justify-between relative min-h-[200px] w-full p-6 rounded-2xl overflow-hidden transition-colors duration-300 ease-in-out hover:-translate-y-0.5 ${
    enableBorderGlow ? "bento-card--glow" : ""
  }`;

  const style: CSSProperties = {
    backgroundColor: card.color || "hsl(var(--card))",
    borderColor: "hsl(var(--border))",
    color: "hsl(var(--card-foreground))",
    border: "1px solid hsl(var(--border))",
    "--glow-x": "50%",
    "--glow-y": "50%",
    "--glow-intensity": "0",
    "--glow-radius": "200px",
  } as CSSProperties;

  return (
    <div ref={ref} className={cls} style={style}>
      {children}
    </div>
  );
}

export default function MagicBento({
  cards,
  glowColor = DEFAULT_GLOW,
  enableTilt = true,
  enableSpotlight = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  className = "",
}: MagicBentoProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <style>{`
        .bento-section {
          --glow-x: 50%;
          --glow-y: 50%;
          --glow-intensity: 0;
          --glow-radius: 200px;
          --glow-color: ${glowColor};
        }
        .bento-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
        @media (min-width: 640px) {
          .bento-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .bento-grid { grid-template-columns: repeat(3, 1fr); }
          /* Featured spans only when there are enough cards to fill without holes.
             With exactly 6 cards at 3 cols = 2 rows of 3, no spans needed.
             With 7+ cards, card 1 spans 2 to create a hero layout. */
          .bento-grid:has(.bento-card:nth-child(7)) .bento-card:nth-child(1) {
            grid-column: span 2;
          }
        }
        .bento-card--glow::after {
          content: '';
          position: absolute;
          inset: 0;
          padding: 2px;
          background: radial-gradient(
            var(--glow-radius) circle at var(--glow-x) var(--glow-y),
            rgba(${glowColor}, calc(var(--glow-intensity) * 0.6)) 0%,
            rgba(${glowColor}, calc(var(--glow-intensity) * 0.3)) 30%,
            transparent 60%
          );
          border-radius: inherit;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 1;
          transition: opacity 0.3s ease;
          z-index: 1;
        }
        .bento-card--glow:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.08), 0 0 30px rgba(${glowColor}, 0.15);
        }
      `}</style>

      {enableSpotlight && (
        <Spotlight gridRef={gridRef} radius={spotlightRadius} glowColor={glowColor} />
      )}

      <div className={`bento-section ${className}`} ref={gridRef}>
        <div className="bento-grid">
          {cards.map((card, i) => (
            <BentoCard
              key={i}
              card={card}
              glowColor={glowColor}
              enableTilt={enableTilt}
              enableBorderGlow
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  {card.icon && (
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      {card.icon}
                    </div>
                  )}
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            </BentoCard>
          ))}
        </div>
      </div>
    </>
  );
}
