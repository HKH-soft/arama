"use client";

import { useState, useEffect } from "react";
import { Play, Wind, Activity, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  category: string;
  icon: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: number;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch("/api/exercises");
        const data = await res.json();
        setExercises(data);
      } catch (err) {
        console.error("Error fetching exercises:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Wind":
        return Wind;
      case "Activity":
        return Activity;
      default:
        return Activity;
    }
  };

  return (
    <>
      <div className="bg-linear-to-b from-emerald-900/45 via-card to-card px-6 pt-6 pb-4 ">
        <h1 className="text-2xl font-bold text-foreground">تمرینات</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          تمرین‌های آرام‌سازی و ذهن‌آگاهی برای سلامت روان
        </p>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {loading && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-full" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {/* Filter chips */}
        {!loading && <div className="flex gap-2 flex-wrap">
          {["همه", "تنفسی", "مدیتیشن", "حرکتی", "ذهن‌آگاهی"].map((chip, i) => (
            <button
              key={i}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${i === 0
                ? "bg-white text-black"
                : "bg-white/5 text-foreground/70 hover:bg-white/10"
                }`}
            >
              {chip}
            </button>
          ))}
        </div>}

        {/* Exercise grid */}
        {!loading && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.length > 0 ? (
            exercises.map((ex, i) => {
              const IconComponent = getIcon(ex.icon);
              return (
                <div
                  key={ex.id}
                  className={`bg-linear-to-br ${ex.color} rounded-xl p-5 border border-border hover:border-border/80 transition-all group cursor-pointer shadow-sm`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-foreground/70" />
                    </div>
                    <span className="text-[11px] text-foreground/40 bg-white/5 px-2 py-1 rounded-full">
                      {ex.difficulty}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">
                    {ex.title}
                  </h3>
                  <p className="text-foreground/60 text-sm mb-4 leading-relaxed">
                    {ex.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-foreground/40 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {ex.duration}
                    </span>
                    <button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-primary/30">
                      <Play className="w-4 h-4 text-foreground fill-white mr-0.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground">تمرینی یافت نشد</p>
          )}
        </div>}
      </div>
    </>
  );
}