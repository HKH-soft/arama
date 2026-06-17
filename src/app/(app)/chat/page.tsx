"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { EmotionBadge, detectEmotion, type Emotion } from "@/components/chat/EmotionBadge";
import { ChatInput } from "@/components/chat/ChatInput";
import { ConversationList } from "@/components/chat/ConversationList";
import { useConversations, useMessages } from "@/hooks/useChat";
import { Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";

export default function Chat() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<Emotion>(null);
  const [emotionConfidence, setEmotionConfidence] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { conversations, load: loadConversations, create, remove } = useConversations();
  const { messages, isStreaming, send, load: loadMessages, clear } = useMessages(activeId);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeId) loadMessages(activeId);
    else clear();
  }, [activeId, loadMessages, clear]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSelect = (id: number) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    const conv = await create("گفتگوی جدید");
    setIsCreating(false);
    if (conv) {
      setActiveId(conv.id);
      setSidebarOpen(false);
    }
  };

  const handleDelete = async (id: number) => {
    await remove(id);
    if (activeId === id) {
      setActiveId(null);
      clear();
    }
  };

  const handleSend = async (text: string) => {
    // Detect emotion from user message
    const { emotion, confidence } = detectEmotion(text);
    if (emotion) {
      setDetectedEmotion(emotion);
      setEmotionConfidence(confidence);
    }

    // Auto-create conversation if none active
    let convId = activeId;
    if (!convId) {
      setIsCreating(true);
      // Use first ~20 chars of message as title
      const title = text.length > 20 ? text.slice(0, 20) + "…" : text;
      const conv = await create(title);
      setIsCreating(false);
      if (!conv) return;
      convId = conv.id;
      setActiveId(conv.id);
    }

    await send(text);
  };

  const today = new Date().toLocaleDateString("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex h-screen bg-background overflow-hidden" dir="rtl">
      <DashboardSidebar />

      {/* Conversation list — desktop */}
      <div className="w-64 border-l border-border bg-card hidden lg:flex flex-col shrink-0">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onCreate={handleCreate}
          onDelete={handleDelete}
          isCreating={isCreating}
        />
      </div>

      {/* Conversation list — mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="absolute right-0 top-0 h-full w-72 bg-card border-l border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end p-3">
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <ConversationList
                conversations={conversations}
                activeId={activeId}
                onSelect={handleSelect}
                onCreate={handleCreate}
                onDelete={handleDelete}
                isCreating={isCreating}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile: open conversation list */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 text-muted-foreground"
              onClick={() => setSidebarOpen(true)}
              data-testid="button-open-sidebar"
            >
              <Menu className="w-4 h-4" />
            </Button>

            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow">
                آ
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-card rounded-full" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm leading-tight">آراما</h2>
              <p className="text-[10px] text-emerald-500 leading-tight">آنلاین</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <EmotionBadge emotion={detectedEmotion} confidence={emotionConfidence} />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground h-8 w-8"
              data-testid="button-chat-settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {/* Date divider */}
          <div className="flex justify-center">
            <span className="text-[11px] text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {today}
            </span>
          </div>

          {/* Empty state */}
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4 px-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="text-3xl">💬</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">سلام، اینجام برات</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  هر چیزی که دلت می‌خواد بگی، بدون قضاوت گوش می‌دم.
                </p>
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, idx) => {
            const isLastAssistant =
              msg.role === "assistant" && idx === messages.length - 1 && isStreaming;
            return (
              <ChatMessage
                key={msg.id}
                message={msg}
                isStreaming={isLastAssistant}
              />
            );
          })}

          {/* Typing indicator — shown only when streaming hasn't started yet */}
          <AnimatePresence>
            {isStreaming && messages[messages.length - 1]?.role === "user" && (
              <TypingIndicator key="typing" />
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-background border-t border-border shrink-0">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={handleSend} disabled={isStreaming || isCreating} />
          </div>
        </div>
      </main>
    </div>
  );
}
