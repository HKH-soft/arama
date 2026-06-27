"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import {
  EmotionBadge,
  detectEmotion,
  type Emotion,
} from "@/components/chat/EmotionBadge";
import { ChatInput } from "@/components/chat/ChatInput";
import { ConversationList } from "@/components/chat/ConversationList";
import { useConversations, useMessages } from "@/hooks/useChat";
import { Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

export default function Chat() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<Emotion>(null);
  const [emotionConfidence, setEmotionConfidence] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    load: loadConversations,
    create,
    remove,
  } = useConversations();
  const {
    messages,
    isStreaming,
    send,
    load: loadMessages,
    clear,
  } = useMessages(activeId);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
    else clear();
  }, [activeId, loadMessages, clear]);

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
    const { emotion, confidence } = detectEmotion(text);
    if (emotion) {
      setDetectedEmotion(emotion);
      setEmotionConfidence(confidence);
    }

    let convId = activeId;
    if (!convId) {
      setIsCreating(true);
      const title = text.length > 20 ? text.slice(0, 20) + "…" : text;
      const conv = await create(title);
      setIsCreating(false);
      if (!conv) return;
      convId = conv.id;
      setActiveId(conv.id);

      // Small delay to ensure the conversation state is updated
      // before attempting to send the message
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    await send(text, convId !== activeId ? convId : undefined);
  };

  const today = new Date().toLocaleDateString("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-row-reverse h-full bg-background gap-2 box-border overflow-hidden">
      <div className="w-64 bg-card border border-border hidden lg:flex flex-col shrink-0 rounded-xl h-full">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onCreate={handleCreate}
          onDelete={handleDelete}
          isCreating={isCreating}
        />
      </div>

      {/* Conversation list — mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 h-full w-72 bg-card border-r border-border shadow-2xl rounded-r-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-start p-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      {/* Removed m-2 to prevent overflow */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-card rounded-xl overflow-hidden border border-border">
        {/* Header */}
        <header className="h-14 border-b border-border bg-muted/40 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile: open conversation list */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>

            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-foreground font-bold text-sm shadow">
                آ
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-background rounded-full" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm leading-tight">
                آراما
              </h2>
              <p className="text-[10px] text-emerald-500 leading-tight">
                آنلاین
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <EmotionBadge
              emotion={detectedEmotion}
              confidence={emotionConfidence}
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground pl-13 md:pl-0 hover:text-foreground h-8 w-8"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {/* Date divider */}
          <div className="flex justify-center">
            <span className="text-[11px] text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border/50">
              {today}
            </span>
          </div>

          {/* Empty state */}
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4 px-6">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="text-3xl">💬</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  سلام، اینجام برات
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  هر چیزی که دلت می‌خواد بگی، بدون قضاوت گوش می‌دم.
                </p>
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, idx) => {
            // Skip empty streaming assistant messages (typing indicator shows instead)
            if (
              msg.role === "assistant" &&
              idx === messages.length - 1 &&
              isStreaming &&
              !msg.content
            ) {
              return null;
            }
            const isLastAssistant =
              msg.role === "assistant" &&
              idx === messages.length - 1 &&
              isStreaming;
            return (
              <ChatMessage
                key={msg.id}
                message={msg}
                isStreaming={isLastAssistant}
              />
            );
          })}

          {/* Typing indicator — shown while streaming and assistant message is still empty */}
          <AnimatePresence>
            {isStreaming &&
              messages[messages.length - 1]?.role === "assistant" &&
              !messages[messages.length - 1]?.content && (
                <TypingIndicator key="typing" />
              )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 sm:p-4 bg-muted/40 border-t border-border shrink-0">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              onSend={handleSend}
              disabled={isStreaming || isCreating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
