"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircleHeart } from "lucide-react";

export function StickyMobileCta() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA only after scrolling past the hero section (approx 150vh or 800px)
      if (window.scrollY > 800) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      aria-hidden={!isVisible}
      className={`fixed inset-x-0 bottom-0 z-40 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] transition-all duration-500 ease-in-out sm:hidden ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="mx-auto max-w-sm">
        <Link
          href="/login"
          className="group flex w-full items-center justify-center gap-3 rounded-full bg-brand-deep px-6 py-4 text-sm font-black text-onbrand shadow-[var(--shadow-brand)] transition-transform active:scale-95"
        >
          <MessageCircleHeart className="size-5 transition-transform duration-500 group-hover:scale-110" />
          شروع گفتگوی امن
        </Link>
      </div>
      {/* subtle gradient mask for the bottom edge */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-full bg-gradient-to-t from-canvas via-canvas/80 to-transparent pointer-events-none" />
    </div>
  );
}
