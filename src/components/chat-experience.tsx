"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  MessageCircleHeart,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  SendHorizonal,
  Trash2,
  Wind,
} from "lucide-react";
import { AramaMark } from "./logo";

type Msg = { id: string; from: "ai" | "user"; text: string; time: string };

type ConversationSummary = {
  id: string;
  title: string;
  updatedAt: string;
  lastMessage: string | null;
};

const nowFa = () =>
  new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });

function updateMessage(msgs: Msg[], id: string, text: string) {
  return msgs.map((m) => (m.id === id ? { ...m, text } : m));
}

export function ChatExperience() {
  const searchParams = useSearchParams();
  const initialConversation = searchParams.get("conversation") ?? undefined;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [lastFailed, setLastFailed] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversation,
  );

  // sidebar
  const [history, setHistory] = useState<ConversationSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // ── load conversation history ──
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch("/api/conversations", { cache: "no-store" });
      const data = (await response.json()) as {
        conversations?: ConversationSummary[];
      };
      setHistory(data.conversations ?? []);
    } catch {
      /* silent */
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // ── load messages for a conversation ──
  const loadConversation = useCallback(async (id: string) => {
    setConversationId(id);
    setError("");
    setMessages([]);
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        messages?: Array<{
          id: string;
          role: string;
          content: string;
          createdAt: string;
        }>;
      };
      setMessages(
        (data.messages ?? []).map((m) => ({
          id: m.id,
          from: m.role === "user" ? "user" : "ai",
          text: m.content,
          time: new Date(m.createdAt).toLocaleTimeString("fa-IR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
      );
    } catch {
      setError("پیام‌های این گفتگو بارگذاری نشدند.");
    }
  }, []);

  // ── initial mount ──
  useEffect(() => {
    void loadHistory();
    if (initialConversation) {
      void loadConversation(initialConversation);
    } else {
      setMessages([
        {
          id: "welcome",
          from: "ai",
          text: "سلام، خوش برگشتی. امروز چه چیزی بر دلت سنگینی می‌کند — یا شاید هم چیزی هست که بخواهی جشن بگیریم؟",
          time: nowFa(),
        },
      ]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── scroll on new messages ──
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, streamingId, error]);

  // ── new conversation ──
  const startNew = () => {
    setConversationId(undefined);
    setError("");
    setMessages([
      {
        id: "welcome",
        from: "ai",
        text: "سلام، خوش برگشتی. امروز چه چیزی بر دلت سنگینی می‌کند — یا شاید هم چیزی هست که بخواهی جشن بگیریم؟",
        time: nowFa(),
      },
    ]);
    setSidebarOpen(false);
  };

  // ── delete conversation ──
  const deleteConversation = async (id: string) => {
    if (!confirm("این گفتگو و همهٔ پیام‌هایش پاک می‌شود. مطمئنی؟")) return;
    setDeletingId(id);
    try {
      await fetch("/api/conversations", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setHistory((cur) => cur.filter((c) => c.id !== id));
      if (conversationId === id) startNew();
    } catch {
      /* silent */
    } finally {
      setDeletingId(null);
    }
  };

  // ── send message ──
  const send = async (provided?: string) => {
    const text = (provided ?? draft).trim();
    if (!text || streamingId) return;
    setDraft("");
    setError("");
    setLastFailed("");
    const assistantId = `assistant-${Date.now()}`;
    setMessages((cur) => [
      ...cur,
      { id: `user-${Date.now()}`, from: "user", text, time: nowFa() },
      { id: assistantId, from: "ai", text: "", time: "در حال نوشتن…" },
    ]);
    setStreamingId(assistantId);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "text/event-stream",
        },
        body: JSON.stringify({ text, conversationId }),
      });
      if (!response.ok || !response.body) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error || "پاسخ آراما دریافت نشد.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let received = false;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const event of events) {
          const line = event
            .split("\n")
            .find((part) => part.startsWith("data: "));
          if (!line) continue;
          const payload = JSON.parse(line.slice(6)) as {
            type?: string;
            text?: string;
            message?: string;
            conversationId?: string;
          };
          if (payload.type === "delta" && payload.text) {
            received = true;
            setMessages((cur) =>
              updateMessage(
                cur,
                assistantId,
                `${cur.find((i) => i.id === assistantId)?.text ?? ""}${payload.text}`,
              ),
            );
          }
          if (payload.type === "done" && payload.conversationId) {
            setConversationId(payload.conversationId);
            void loadHistory();
          }
          if (payload.type === "error")
            throw new Error(payload.message || "پاسخ آراما کامل نشد.");
        }
      }
      if (!received)
        throw new Error("پاسخ آراما خالی بود؛ دوباره تلاش کن.");
      setMessages((cur) =>
        cur.map((i) =>
          i.id === assistantId ? { ...i, time: nowFa() } : i,
        ),
      );
    } catch (err) {
      setMessages((cur) => cur.filter((i) => i.id !== assistantId));
      setError(err instanceof Error ? err.message : "ارتباط با آراما قطع شد.");
      setLastFailed(text);
    } finally {
      setStreamingId(null);
    }
  };

  const welcomeOnly =
    messages.length === 1 && messages[0].id === "welcome" && !streamingId;

  return (
    <div className="relative flex h-[calc(100dvh-7.5rem)] min-h-0 lg:h-dvh">
      {/* mobile history drawer overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="بستن تاریخچه"
          className="absolute inset-0 z-20 bg-ink/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── conversation sidebar ── */}
      <aside
        className={`absolute inset-y-0 end-0 z-30 flex w-[min(20rem,88vw)] shrink-0 flex-col border-s border-line bg-card shadow-[var(--shadow-lift)] transition-transform duration-300 lg:static lg:z-0 lg:w-72 lg:border-e lg:border-s-0 lg:bg-card/70 lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-4">
          <h2 className="text-sm font-extrabold text-ink">گفتگوهای قبلی</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startNew}
              className="grid size-8 place-items-center rounded-full bg-brand-deep text-onbrand"
              aria-label="گفتگوی جدید"
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="grid size-8 place-items-center rounded-full border border-line text-soft lg:hidden"
              aria-label="بستن"
            >
              <PanelLeftClose className="size-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {historyLoading && (
            <div className="space-y-3 p-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="calm-skeleton h-16 rounded-2xl" />
              ))}
            </div>
          )}
          {!historyLoading && history.length === 0 && (
            <div className="p-6 text-center text-xs text-faint">
              هنوز گفتگویی ثبت نشده
            </div>
          )}
          {!historyLoading &&
            history.map((c) => (
              <div
                key={c.id}
                className={`group flex items-center gap-2 border-b border-line px-4 py-3 transition-colors ${
                  conversationId === c.id ? "bg-tint-strong" : "hover:bg-tint"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    void loadConversation(c.id);
                    setSidebarOpen(false);
                  }}
                  className="min-w-0 flex-1 text-start"
                >
                  <p className="truncate text-xs font-bold text-ink">{c.title}</p>
                  {c.lastMessage && (
                    <p className="mt-1 truncate text-[10px] text-faint">{c.lastMessage}</p>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => void deleteConversation(c.id)}
                  disabled={deletingId === c.id}
                  aria-label={`حذف ${c.title}`}
                  className="grid size-7 shrink-0 place-items-center rounded-full text-faint opacity-100 transition-all hover:bg-danger/10 hover:text-danger disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  {deletingId === c.id ? (
                    <span className="animate-breathe size-2 rounded-full bg-danger" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                </button>
              </div>
            ))}
        </div>
      </aside>

      {/* ── main chat area ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-canvas/80 px-4 py-3 backdrop-blur-xl sm:px-8 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? "بستن تاریخچه" : "نمایش تاریخچه"}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-card text-soft transition-colors hover:text-brand-ink"
            >
              {sidebarOpen ? <PanelLeftClose className="size-4.5" /> : <PanelLeftOpen className="size-4.5" />}
            </button>
            <div className="relative">
              <AramaMark className="size-11" />
              <span
                className="absolute -bottom-0.5 -left-0.5 size-3 rounded-full border-2 border-canvas bg-brand"
                aria-hidden
              />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-black text-ink sm:text-base">
                گفتگو با آراما
              </h1>
              <p className="truncate text-[11px] font-medium text-faint">
                گفتگوی رمزنگاری‌شده و محرمانه
              </p>
            </div>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-tint-strong px-3.5 py-1.5 text-[11px] font-bold text-brand-ink sm:inline-flex">
            <span
              className="size-1.5 animate-pulse rounded-full bg-brand-deep"
              aria-hidden
            />
            همراه فعال
          </span>
        </header>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8"
          aria-live="polite"
        >
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            <p className="mx-auto rounded-full bg-card px-4 py-1.5 text-[10px] font-bold text-faint shadow-[var(--shadow-soft)]">
              امروز
            </p>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.from === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`animate-rise w-fit max-w-[88%] px-4.5 py-3.5 text-sm leading-7 sm:max-w-[80%] ${
                    m.from === "ai"
                      ? "rounded-3xl rounded-tr-md border border-line bg-card text-ink shadow-[var(--shadow-soft)]"
                      : "rounded-3xl rounded-tl-md bg-brand-deep text-onbrand shadow-[var(--shadow-brand)]"
                  }`}
                >
                  {m.text || (
                    <span
                      className="inline-flex items-center gap-1.5"
                      aria-label="آراما در حال نوشتن است"
                    >
                      <span className="typing-dot size-1.5 rounded-full bg-brand-ink" />
                      <span className="typing-dot size-1.5 rounded-full bg-brand-ink" />
                      <span className="typing-dot size-1.5 rounded-full bg-brand-ink" />
                    </span>
                  )}
                </div>
                <span className="mt-1.5 px-1.5 text-[10px] font-semibold text-faint">
                  {m.time}
                </span>
              </div>
            ))}

            {error && (
              <div
                role="alert"
                className="rounded-3xl border border-danger/25 bg-danger/5 p-4 text-sm text-danger"
              >
                <p className="font-bold">{error}</p>
                <button
                  type="button"
                  onClick={() => void send(lastFailed)}
                  disabled={!lastFailed}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-danger/25 px-4 py-2 text-xs font-bold hover:bg-danger/10 disabled:opacity-50"
                >
                  <RefreshCw className="size-3.5" />
                  تلاش دوباره
                </button>
              </div>
            )}

            {welcomeOnly && (
              <div className="mt-1 flex flex-wrap gap-2 self-start">
                {[
                  "دست‌م هنوز می‌لرزد",
                  "باشه، بیا نفس بکشیم",
                  "نمی‌دانم از کجا شروع کنم",
                ].map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => void send(choice)}
                    className="rounded-full border border-brand/25 bg-card px-4 py-2 text-xs font-bold text-brand-ink transition-all duration-300 hover:bg-tint"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-2 flex items-center gap-4 self-start rounded-3xl border border-brand/20 bg-tint/70 px-5 py-4">
              <span className="animate-breathe grid size-11 shrink-0 place-items-center rounded-full bg-brand-deep text-onbrand">
                <Wind className="size-5" />
              </span>
              <div>
                <p className="text-xs font-extrabold text-brand-ink">
                  تمرین تنفس ۴-۷-۸
                </p>
                <p className="mt-1 text-[11px] font-medium leading-5 text-soft">
                  دو دقیقه با هم؛ دم ۴، نگه ۷، بازدم ۸
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-line bg-canvas/80 px-3 py-3 backdrop-blur-xl sm:px-8 sm:py-4">
          <form
            className="mx-auto flex max-w-2xl items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <button
              type="button"
              aria-label="افزودن پیوست"
              className="hidden size-11 shrink-0 place-items-center rounded-full bg-card text-soft shadow-[var(--shadow-soft)] hover:text-brand-ink sm:grid"
            >
              <Plus className="size-5" />
            </button>
            <label htmlFor="chat-input" className="sr-only">
              پیام تو به آراما
            </label>
            <input
              id="chat-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="هرچه در دلت است، اینجا بنویس…"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-full border border-line bg-card px-4 py-3 text-sm text-ink shadow-[var(--shadow-soft)] outline-none transition-all placeholder:text-faint focus:border-brand focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand)_14%,transparent)] sm:px-5 sm:py-3.5"
            />
            <button
              type="button"
              aria-label="پیام صوتی"
              className="hidden size-11 shrink-0 place-items-center rounded-full bg-card text-soft shadow-[var(--shadow-soft)] hover:text-brand-ink sm:grid"
            >
              <Mic className="size-5" />
            </button>
            <button
              type="submit"
              aria-label="ارسال پیام"
              disabled={!draft.trim() || !!streamingId}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-deep text-onbrand shadow-[var(--shadow-brand)] transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:opacity-50"
            >
              <SendHorizonal className="size-5" />
            </button>
          </form>
          <p className="mx-auto mt-2 max-w-2xl text-center text-[10px] leading-5 text-faint sm:mt-3">
            آراما جایگزین درمانگر نیست؛ در بحران با ۱۲۳ تماس بگیر
          </p>
        </div>
      </div>
    </div>
  );
}
