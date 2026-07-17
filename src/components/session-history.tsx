"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, MessageCircleHeart, RefreshCw, Trash2, WifiOff } from "lucide-react";

type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
};

export function SessionHistory() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/conversations", { cache: "no-store" });
      const data = (await response.json()) as { conversations?: Conversation[]; error?: string };
      if (!response.ok) throw new Error(data.error || "بارگذاری نشد.");
      setItems(data.conversations ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تاریخچهٔ گفتگوها بارگذاری نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("این گفتگو و همهٔ پیام‌هایش برای همیشه پاک می‌شود. مطمئنی؟")) return;
    setDeleting(id);
    try {
      const response = await fetch("/api/conversations", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("حذف انجام نشد.");
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف گفتگو انجام نشد.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card-soft flex items-center gap-4 rounded-[1.75rem] p-5">
            <div className="calm-skeleton size-12 shrink-0 rounded-2xl" />
            <div className="flex-1">
              <div className="calm-skeleton h-4 w-48 rounded-full" />
              <div className="calm-skeleton mt-3 h-3 w-full rounded-full" />
            </div>
            <div className="calm-skeleton h-8 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="card-soft rounded-[1.75rem] p-12 text-center">
        <WifiOff className="mx-auto size-8 text-danger" />
        <p className="mt-4 text-sm font-bold text-ink">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-deep px-5 py-2.5 text-xs font-bold text-onbrand"
        >
          <RefreshCw className="size-3.5" />
          تلاش دوباره
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card-soft rounded-[1.75rem] p-12 text-center">
        <BookOpen className="mx-auto size-9 text-faint" />
        <p className="mt-4 text-base font-extrabold text-ink">هنوز گفتگویی ثبت نشده</p>
        <p className="mt-2 text-sm leading-7 text-soft">
          اولین گفتگویت با آراما از صفحهٔ «گفتگو» شروع می‌شود.
        </p>
        <Link
          href="/chat"
          className="mt-5 inline-flex rounded-full bg-brand-deep px-6 py-3 text-sm font-bold text-onbrand shadow-[var(--shadow-brand)]"
        >
          شروع گفتگو
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div role="alert" className="mb-4 rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-xs font-semibold text-danger">
          {error}
        </div>
      )}
      {items.map((item) => {
        const date = new Date(item.updatedAt).toLocaleDateString("fa-IR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        return (
          <div
            key={item.id}
            className="card-soft group flex items-center gap-4 rounded-[1.75rem] p-5 transition-all duration-300 hover:shadow-[var(--shadow-lift)]"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-tint-strong text-brand-ink">
              <MessageCircleHeart className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-extrabold text-ink">{item.title}</h3>
              </div>
              {item.lastMessage && (
                <p className="mt-1 truncate text-xs text-faint">{item.lastMessage}</p>
              )}
              <p className="mt-1 text-[10px] font-semibold text-faint">{date}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/chat?conversation=${item.id}`}
                className="rounded-full bg-tint px-3.5 py-2 text-[11px] font-bold text-brand-ink transition-colors hover:bg-tint-strong"
              >
                ادامه
              </Link>
              <button
                type="button"
                onClick={() => void remove(item.id)}
                disabled={deleting === item.id}
                aria-label={`حذف گفتگوی ${item.title}`}
                className="grid size-9 place-items-center rounded-full text-faint transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
              >
                {deleting === item.id ? (
                  <span className="animate-breathe size-3 rounded-full bg-danger" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
