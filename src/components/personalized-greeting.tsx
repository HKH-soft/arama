"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export function PersonalizedGreeting({ defaultName }: { defaultName: string }) {
  const [greeting, setGreeting] = useState<{ text: string; insight: string } | null>(null);

  useEffect(() => {
    // Check if we have a cached greeting for today
    const cacheKey = `arama-greeting-${new Date().toDateString()}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        setGreeting(JSON.parse(cached));
        return;
      } catch (e) {
        // Ignore cache error
      }
    }

    // Fetch new greeting
    fetch("/api/greeting")
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        if (data.text && data.insight) {
          setGreeting(data);
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
        }
      })
      .catch(() => {
        // Fallback silently
      });
  }, []);

  // Time-based fallback greeting
  const getFallbackGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `صبح بخیر ${defaultName}`;
    if (hour < 17) return `ظهر بخیر ${defaultName}`;
    if (hour < 20) return `عصر بخیر ${defaultName}`;
    return `شب بخیر ${defaultName}`;
  };

  return (
    <div className="min-w-0">
      <h1 className="truncate text-base font-black text-ink sm:text-xl">
        {greeting ? greeting.text : getFallbackGreeting()}
      </h1>
      {greeting && (
        <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-brand-ink/80 animate-fade-in">
          <Sparkles className="size-3.5" />
          {greeting.insight}
        </p>
      )}
    </div>
  );
}
