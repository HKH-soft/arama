"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  CloudRain,
  Copy,
  Flame,
  Headphones,
  MessageCircleHeart,
  Mic,
  MicOff,
  Moon,
  Music,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  SendHorizonal,
  Sparkles,
  Trash2,
  Volume2,
  Waves,
  Wind,
} from "lucide-react";
import { AramaMark } from "./logo";
import { Ambient } from "./ambient";
import { useAmbientPlayer } from "./ambient-provider";

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
  const initialConversation =
    searchParams.get("conversation") ?? searchParams.get("id") ?? undefined;

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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);

  // ambient player for calming audio during chat
  const ambient = useAmbientPlayer();
  const [ambientMenuOpen, setAmbientMenuOpen] = useState(false);

  const ambientSoundscapes = [
    { id: "rain", title: "باران پشت پنجره", icon: CloudRain, url: "/audio/rain-window.wav", art: "/images/meditation/forest-ambience.jpg" },
    { id: "sleep", title: "فرکانس ۴۳۲ هرتز خواب", icon: Moon, url: "/audio/deep-sleep-432hz.wav", art: "/images/meditation/night-safe.jpg" },
    { id: "fire", title: "شومینه و کلبه چوبی", icon: Flame, url: "/audio/fireplace-cabin.wav", art: "/images/meditation/night-safe.jpg" },
    { id: "ocean", title: "امواج عمیق اقیانوس", icon: Waves, url: "/audio/ocean-waves-deep.wav", art: "/images/meditation/ocean-calm.jpg" },
    { id: "bowl", title: "کاسه تبتی ۵۲۸ هرتز", icon: Music, url: "/audio/tibetan-singing-bowl.wav", art: "/images/meditation/bell-vibrant.jpg" },
    { id: "forest", title: "پرندگان و رودخانه", icon: Wind, url: "/audio/forest-birds-stream.wav", art: "/images/meditation/forest-ambience.jpg" },
  ];

  const copyText = (id: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const speakText = (id: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fa-IR";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("مرورگر شما از ورودی صوتی پشتیبانی نمی‌کند.");
      return;
    }

    if (listening) {
      setListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "fa-IR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setListening(true);
      recognition.onresult = (event: { results: Array<Array<{ transcript: string }>> }) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setDraft((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      recognition.onerror = () => setListening(false);
      recognition.onend = () => setListening(false);
      recognition.start();
    } catch {
      setListening(false);
    }
  };

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
          text: "سلام! من اینجام که بشنوم. امروز دلت می‌خواد دربارهٔ چی حرف بزنیم؟",
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
        text: "سلام! من اینجام که بشنوم. امروز دلت می‌خواد دربارهٔ چی حرف بزنیم؟",
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
          let payload: {
            type?: string;
            text?: string;
            message?: string;
            conversationId?: string;
          } | null = null;
          try {
            payload = JSON.parse(line.slice(6));
          } catch {
            continue;
          }
          if (!payload) continue;
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
            <div className="flex h-40 flex-col items-center justify-center p-6 text-center">
              <div className="grid size-12 place-items-center rounded-2xl bg-tint text-brand-ink mb-3 shadow-[var(--shadow-soft)]">
                <MessageCircleHeart className="size-5" />
              </div>
              <p className="text-xs font-bold text-ink mb-1">هنوز گفتگویی نیست</p>
              <p className="text-[11px] font-medium text-soft leading-5">اولین گفتگوی خودت را با آراما شروع کن.</p>
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

          {/* ── Ambient Soundscape Controller ── */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setAmbientMenuOpen((v) => !v)}
              className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold transition-all ${
                ambient.track
                  ? "border-brand-glow/40 bg-brand-glow/10 text-brand-glow shadow-sm"
                  : "border-line/70 bg-card text-soft hover:bg-tint hover:text-brand-ink shadow-sm"
              }`}
              title="پخش صوت آرامش‌بخش در پس‌زمینه"
            >
              {ambient.track ? (
                <>
                  <span className="flex items-center gap-0.5" aria-hidden>
                    <span className="wave-bar h-3 w-0.5 rounded-full bg-brand-glow" />
                    <span className="wave-bar h-4 w-0.5 rounded-full bg-brand-glow" style={{ animationDelay: "0.15s" }} />
                    <span className="wave-bar h-2.5 w-0.5 rounded-full bg-brand-glow" style={{ animationDelay: "0.3s" }} />
                  </span>
                  <span className="hidden sm:inline font-extrabold">{ambient.track.title}</span>
                </>
              ) : (
                <>
                  <Headphones className="size-4 text-brand-ink" />
                  <span className="hidden sm:inline">صوت آرامش</span>
                </>
              )}
            </button>

            {ambientMenuOpen && (
              <div className="absolute start-0 sm:start-auto sm:end-0 top-full mt-2 z-50 w-64 rounded-2xl border border-line bg-card/95 p-3 shadow-[var(--shadow-lift)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-line mb-2">
                  <span className="text-xs font-black text-ink">صوت پس‌زمینه گفتگو</span>
                  {ambient.track && (
                    <button
                      type="button"
                      onClick={() => {
                        ambient.setTrack(null);
                        setAmbientMenuOpen(false);
                      }}
                      className="text-[10px] font-bold text-rose-500 hover:underline"
                    >
                      توقف صدا
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  {ambientSoundscapes.map((snd) => {
                    const isCurrent = ambient.track?.audioUrl === snd.url;
                    const Icon = snd.icon;
                    return (
                      <button
                        key={snd.id}
                        type="button"
                        onClick={() => {
                          if (isCurrent) {
                            ambient.setTrack(null);
                          } else {
                            ambient.setTrack({
                              id: `ambient-${snd.id}`,
                              title: snd.title,
                              coverArt: snd.art,
                              audioUrl: snd.url,
                              createdAt: new Date(),
                            });
                          }
                          setAmbientMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                          isCurrent
                            ? "bg-brand-deep text-onbrand"
                            : "hover:bg-tint text-ink"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="size-3.5" />
                          <span>{snd.title}</span>
                        </span>
                        {isCurrent && <Check className="size-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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
                    <div className="relative group/msg w-full">
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

                      {/* Action buttons (Copy & TTS) */}
                      {m.text && (
                        <div className={`mt-1 flex items-center gap-1.5 opacity-0 group-hover/msg:opacity-100 transition-opacity ${isUser ? "justify-end" : "justify-start"}`}>
                          <button
                            type="button"
                            onClick={() => copyText(m.id, m.text)}
                            className="p-1 rounded-lg text-faint hover:text-ink hover:bg-card text-xs flex items-center gap-1 transition"
                            title="کپی متن"
                          >
                            {copiedId === m.id ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                            {copiedId === m.id && <span className="text-[10px] text-emerald-600">کپی شد</span>}
                          </button>
                          {!isUser && (
                            <button
                              type="button"
                              onClick={() => speakText(m.id, m.text)}
                              className={`p-1 rounded-lg text-xs flex items-center gap-1 transition ${speakingId === m.id ? "text-brand-glow bg-brand-glow/10" : "text-faint hover:text-ink hover:bg-card"}`}
                              title={speakingId === m.id ? "توقف خواندن" : "شنیدن پیام"}
                            >
                              <Volume2 className={`size-3 ${speakingId === m.id ? "animate-pulse" : ""}`} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {isLastInGroup && (
                      <span className={`mt-1 px-2 text-[10px] font-semibold text-faint ${isUser ? "text-right" : "text-left"}`}>
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
              <div className="mt-5 space-y-3">
                <p className="text-xs font-extrabold text-soft">می‌توانی از این موضوعات شروع کنی یا هر احساسی داری بنویسی:</p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {[
                    { label: "مهار فوری تپش قلب و پانیک (SOS)", prompt: "تپش قلب و اضطراب شدید دارم، لطفاً یک تمرین فوری برای مهار پانیک بهم بده.", emoji: "🚨", color: "border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/5" },
                    { label: "خواب آرام و رهایی از فکر شبانه", prompt: "خوابم نمی‌بره و مغزم از فکر و خیال خاموش نمیشه؛ کمکم کن بخوابم.", emoji: "🌙", color: "border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-500/5" },
                    { label: "تمرین تنفس هدایت‌شده ۴-۴-۴-۴", prompt: "یک تمرین هدایت‌شده تنفس جعبه‌ای با من شروع کن تا آروم بشم.", emoji: "🌬️", color: "border-teal-500/20 hover:border-teal-500/50 hover:bg-teal-500/5" },
                    { label: "تخلیه غم، تنهایی و دلتنگی", prompt: "خیلی احساس تنهایی و غم دارم و دلم گرفته؛ نیاز به یک گوش شنوا دارم.", emoji: "🤍", color: "border-brand/20 hover:border-brand/50 hover:bg-brand/5" },
                    { label: "غلبه بر تنبلی و عذاب وجدان", prompt: "دچار اهمال‌کاری و بی‌انگیزگی شدم و عذاب وجدان دارم؛ چطور یک قدم بردارم؟", emoji: "🎯", color: "border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/5" },
                    { label: "شنیدن صدای باران در پس‌زمینه", action: "rain", emoji: "🌧️", color: "border-sky-500/20 hover:border-sky-500/50 hover:bg-sky-500/5" },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (item.action === "rain") {
                          ambient.setTrack({
                            id: "ambient-rain",
                            title: "باران پشت پنجره",
                            coverArt: "/images/meditation/forest-ambience.jpg",
                            audioUrl: "/audio/rain-window.wav",
                            createdAt: new Date(),
                          });
                        } else if (item.prompt) {
                          void send(item.prompt);
                        }
                      }}
                      className={`flex items-center gap-3 rounded-2xl border bg-card/90 p-3.5 text-start shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] ${item.color}`}
                    >
                      <span className="text-xl shrink-0">{item.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-extrabold text-ink">{item.label}</span>
                        <span className="block text-[11px] text-soft mt-0.5 truncate">
                          {item.action === "rain" ? "پخش صدای باران در حین گفتگو با آراما" : item.prompt}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-t from-canvas via-canvas/95 to-transparent px-3 pb-4 pt-3 sm:px-8 sm:pb-6">
          {/* Aramia-style Quick SOS & Mindfulness Tools Bar */}
          <div className="mx-auto max-w-2xl mb-2.5">
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => void send("تپش قلب و اضطراب شدید دارم؛ لطفاً یک تمرین فوری برای مهار پانیک بهم بده.")}
                className="shrink-0 flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-[11px] font-black text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all shadow-sm"
              >
                <span>🚨</span>
                <span>مهار فوری پانیک (SOS)</span>
              </button>
              <button
                type="button"
                onClick={() => void send("خوابم نمی‌بره و درگیر نشخوار فکری هستم؛ چطور ذهنم رو خاموش کنم؟")}
                className="shrink-0 flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all"
              >
                <span>🌙</span>
                <span>آرامش خواب</span>
              </button>
              <button
                type="button"
                onClick={() => void send("یک تمرین هدایت‌شده تنفس جعبه‌ای ۴-۴-۴-۴ با من شروع کن.")}
                className="shrink-0 flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 transition-all"
              >
                <span>🌬️</span>
                <span>تنفس جعبه‌ای</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  ambient.setTrack({
                    id: "ambient-rain",
                    title: "باران پشت پنجره",
                    coverArt: "/images/meditation/forest-ambience.jpg",
                    audioUrl: "/audio/rain-window.wav",
                    createdAt: new Date(),
                  });
                }}
                className="shrink-0 flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-[11px] font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-500/20 transition-all"
              >
                <span>🌧️</span>
                <span>صدای باران</span>
              </button>
              <button
                type="button"
                onClick={() => void send("دچار اهمال‌کاری و بی‌انگیزگی شدم و عذاب وجدان دارم؛ چطور شروع کنم؟")}
                className="shrink-0 flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-all"
              >
                <span>🎯</span>
                <span>حل اهمال‌کاری</span>
              </button>
              <button
                type="button"
                onClick={() => void send("خیلی احساس تنهایی و غم دارم؛ نیاز به یک گوش شنوا دارم.")}
                className="shrink-0 flex items-center gap-1.5 rounded-full border border-brand/30 bg-card px-3 py-1.5 text-[11px] font-bold text-brand-ink hover:bg-tint transition-all"
              >
                <span>🤍</span>
                <span>تخلیه غم</span>
              </button>
            </div>
          </div>

          {listening && (
            <div className="mx-auto max-w-2xl mb-2 text-center">
              <span className="text-xs font-bold text-rose-500 animate-pulse flex items-center justify-center gap-1.5">
                <span className="size-2 rounded-full bg-rose-500" />
                در حال شنیدن صدای شما... صحبت کنید...
              </span>
            </div>
          )}

          <form
            className="mx-auto flex max-w-2xl items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <label htmlFor="chat-input" className="sr-only">
              پیام تو به آراما
            </label>
            <div className="group relative flex min-w-0 flex-1 items-center">
              <input
                id="chat-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={listening ? "در حال گوش دادن... صحبت کنید..." : "اینجا بنویس…"}
                autoComplete="off"
                className={`w-full rounded-2xl border bg-card/90 px-4 py-3.5 pr-12 text-base sm:text-sm font-medium text-ink shadow-[var(--shadow-soft)] outline-none backdrop-blur-md transition-all placeholder:text-faint focus-within:border-brand-glow focus-within:ring-4 focus-within:ring-brand-glow/10 sm:py-4 sm:pr-14 ${
                  listening ? "border-rose-400 ring-4 ring-rose-500/10" : "border-line/80"
                }`}
              />
              <button
                type="button"
                onClick={toggleVoiceInput}
                aria-label={listening ? "توقف ضبط صدا" : "ورودی صوتی"}
                className={`absolute right-2 grid size-9 place-items-center rounded-xl transition-colors sm:right-2 sm:size-10 ${
                  listening
                    ? "bg-rose-500 text-white animate-pulse"
                    : "text-faint hover:bg-tint hover:text-brand-ink"
                }`}
              >
                {listening ? <MicOff className="size-4 sm:size-5" /> : <Mic className="size-4 sm:size-5" />}
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
