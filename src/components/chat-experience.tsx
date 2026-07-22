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
import { Ambient } from "./ambient";

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
          text: "سلام، خوش برگشتی. امروز چطور می‌توانم کنارت باشم؟",
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
        text: "سلام، خوش برگشتی. امروز چطور می‌توانم کنارت باشم؟",
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
    <div className="relative flex h-[calc(100svh-7.5rem)] min-h-0 lg:h-svh bg-canvas overflow-hidden">
      {/* ── background ambient ── */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40 dark:opacity-20 mix-blend-multiply dark:mix-blend-screen transition-opacity duration-1000">
        <Ambient variant="warm" />
        {/* Glass overlay to ensure readability */}
        <div className="absolute inset-0 bg-canvas/40 backdrop-blur-[60px]" />
      </div>

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
        className={`absolute inset-y-0 right-0 z-30 flex w-[min(20rem,88vw)] shrink-0 flex-col border-l border-line bg-card/95 backdrop-blur-xl shadow-[var(--shadow-lift)] transition-transform duration-300 lg:static lg:z-0 lg:w-72 lg:border-l lg:border-r-0 lg:bg-card/60 lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:opacity-0"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <h2 className="text-sm font-extrabold text-ink">تاریخچهٔ گفتگو</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startNew}
              className="grid size-8 place-items-center rounded-full bg-brand-deep text-onbrand shadow-[var(--shadow-brand)] hover:scale-105 transition-transform"
              aria-label="گفتگوی جدید"
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="grid size-8 place-items-center rounded-full bg-tint text-brand-ink lg:hidden"
              aria-label="بستن"
            >
              <PanelLeftClose className="size-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {historyLoading && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="calm-skeleton h-16 rounded-2xl" />
              ))}
            </div>
          )}
          {!historyLoading && history.length === 0 && (
            <div className="p-6 text-center text-xs font-medium text-faint">
              هنوز گفتگویی ثبت نشده است.
            </div>
          )}
          {!historyLoading &&
            history.map((c) => (
              <div
                key={c.id}
                className={`group mb-1 flex items-center gap-2 rounded-2xl px-3 py-3 transition-colors ${
                  conversationId === c.id ? "bg-tint-strong border border-brand/10" : "hover:bg-tint/60 border border-transparent"
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
                    <p className="mt-1 truncate text-[11px] font-medium text-soft">{c.lastMessage}</p>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => void deleteConversation(c.id)}
                  disabled={deletingId === c.id}
                  aria-label={`حذف ${c.title}`}
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-danger/5 text-danger opacity-100 transition-all hover:bg-danger hover:text-white disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  {deletingId === c.id ? (
                    <span className="animate-breathe size-1.5 rounded-full bg-danger" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                </button>
              </div>
            ))}
        </div>
      </aside>

      {/* ── main chat area ── */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col shadow-[-12px_0_40px_rgba(0,0,0,0.02)]">
        <header className="flex items-center justify-between gap-3 border-b border-line/60 bg-canvas/40 px-4 py-3 backdrop-blur-2xl sm:px-8 sm:py-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? "بستن تاریخچه" : "نمایش تاریخچه"}
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-soft shadow-[var(--shadow-soft)] transition-colors hover:text-brand-ink hover:shadow-[var(--shadow-lift)]"
            >
              {sidebarOpen ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
            </button>
            <div className="relative shrink-0">
              <AramaMark className="size-10 sm:size-12 drop-shadow-sm" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold text-ink sm:text-lg">
                گفتگو با آراما
              </h1>
              <div className="mt-0.5 flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className="animate-breathe size-1.5 rounded-full bg-brand-glow shadow-[0_0_8px_var(--brand-glow)]"
                    aria-hidden
                  />
                  <span className="text-[10px] font-bold text-brand-ink">همراه فعال</span>
                </div>
                <span className="text-[10px] font-bold text-soft/50">•</span>
                <span className="text-[10px] font-medium text-soft">گفتگوی محرمانه</span>
              </div>
            </div>
          </div>
        </header>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 no-scrollbar"
          aria-live="polite"
        >
          <div className="mx-auto flex max-w-2xl flex-col pb-4">
            <div className="mb-6 flex justify-center">
              <span className="rounded-full border border-line/50 bg-card/40 px-4 py-1.5 text-[10px] font-bold text-faint backdrop-blur-md">
                امروز
              </span>
            </div>
            {messages.map((m, i) => {
              const isUser = m.from === "user";
              const prev = messages[i - 1];
              const next = messages[i + 1];
              const isFirstInGroup = !prev || prev.from !== m.from;
              const isLastInGroup = !next || next.from !== m.from;
              
              // Dynamic spacing
              const marginTop = isFirstInGroup && i > 0 ? "mt-5" : "mt-1";
              
              // Dynamic corners for grouping
              const roundedClasses = isUser
                ? `rounded-3xl ${!isFirstInGroup ? "rounded-tr-md" : ""} ${!isLastInGroup ? "rounded-br-md" : ""}`
                : `rounded-3xl ${!isFirstInGroup ? "rounded-tl-md" : ""} ${!isLastInGroup ? "rounded-bl-md" : ""}`;

              return (
                <div
                  key={m.id}
                  className={`animate-rise flex w-full flex-col ${marginTop}`}
                >
                  <div className={`flex flex-col w-fit max-w-[88%] sm:max-w-[82%] ${isUser ? "ml-auto items-end" : "mr-auto items-start"}`}>
                    <div
                      className={`px-4.5 py-3.5 text-sm leading-7 sm:text-[15px] sm:leading-8 ${roundedClasses} ${
                        isUser
                          ? "bg-brand-deep text-onbrand shadow-[var(--shadow-brand)]"
                          : "bg-card border border-line/60 text-ink shadow-[var(--shadow-soft)]"
                      }`}
                    >
                      {m.text || (
                        <div className="flex h-4 items-center gap-0.5 px-1 py-1" aria-label="آراما در حال فکر کردن است">
                          <span className="wave-bar w-1 rounded-full bg-brand-glow opacity-80" />
                          <span className="wave-bar w-1 rounded-full bg-brand-glow opacity-60" style={{ animationDelay: "0.15s" }} />
                          <span className="wave-bar w-1 rounded-full bg-brand-glow opacity-40" style={{ animationDelay: "0.3s" }} />
                        </div>
                      )}
                    </div>
                    {isLastInGroup && (
                      <span className={`mt-1.5 px-2 text-[10px] font-semibold text-faint ${isUser ? "text-right" : "text-left"}`}>
                        {m.time}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-3xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger shadow-sm backdrop-blur-md"
              >
                <p className="font-bold">{error}</p>
                <button
                  type="button"
                  onClick={() => void send(lastFailed)}
                  disabled={!lastFailed}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-2 text-xs font-bold hover:bg-danger/20 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="size-3.5" />
                  تلاش دوباره
                </button>
              </div>
            )}

            {welcomeOnly && (
              <div className="mt-4 flex flex-wrap gap-2 self-start">
                {[
                  "دست‌م هنوز می‌لرزد",
                  "باشه، بیا نفس بکشیم",
                  "نمی‌دانم از کجا شروع کنم",
                ].map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => void send(choice)}
                    className="rounded-full border border-brand/20 bg-card/80 px-4 py-2.5 text-xs font-bold text-brand-ink shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-tint hover:shadow-[var(--shadow-soft)]"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            )}


          </div>
        </div>

        <div className="bg-gradient-to-t from-canvas via-canvas/95 to-transparent px-3 pb-4 pt-6 sm:px-8 sm:pb-6">
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
              className="hidden size-12 shrink-0 place-items-center rounded-2xl bg-card text-faint shadow-[var(--shadow-soft)] transition-colors hover:bg-tint hover:text-brand-ink sm:grid"
            >
              <Plus className="size-5" />
            </button>
            <label htmlFor="chat-input" className="sr-only">
              پیام تو به آراما
            </label>
            <div className="group relative flex min-w-0 flex-1 items-center">
              <input
                id="chat-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="اینجا بنویس…"
                autoComplete="off"
                className="w-full rounded-2xl border border-line/80 bg-card/90 px-4 py-3.5 pr-12 text-sm font-medium text-ink shadow-[var(--shadow-soft)] outline-none backdrop-blur-md transition-all placeholder:text-faint focus-within:border-brand-glow focus-within:ring-4 focus-within:ring-brand-glow/10 sm:py-4 sm:pr-14"
              />
              <button
                type="button"
                aria-label="پیام صوتی"
                className="absolute right-2 grid size-9 place-items-center rounded-xl text-faint transition-colors hover:bg-tint hover:text-brand-ink sm:right-2 sm:size-10"
              >
                <Mic className="size-4 sm:size-5" />
              </button>
            </div>
            <button
              type="submit"
              aria-label="ارسال پیام"
              disabled={!draft.trim() || !!streamingId}
              className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-deep text-onbrand shadow-[var(--shadow-brand)] transition-all duration-300 hover:scale-105 hover:bg-brand disabled:scale-100 disabled:opacity-40 sm:size-14"
            >
              <SendHorizonal className="size-5 sm:size-6 translate-x-[-1px] rtl:translate-x-[1px]" />
            </button>
          </form>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[10px] font-semibold text-faint sm:mt-4">
            آراما جایگزین درمانگر نیست • در بحران: ۱۲۳
          </p>
        </div>
      </div>
    </div>
  );
}
