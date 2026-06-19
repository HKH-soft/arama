"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isAI = message.role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-end gap-3 ${isAI ? "flex-row-reverse" : ""}`}
      data-testid={`message-${message.role}-${message.id}`}
    >
      {/* Avatar */}
      {isAI ? (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
          <Brain className="w-4 h-4" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-[10px] font-medium text-white/60 shrink-0">
          شما
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[85%] sm:max-w-[72%] px-4 py-3 text-sm leading-7 rounded-2xl shadow-sm
          ${
            isAI
              ? "bg-[#1e1e1e] text-white/90 rounded-bl-sm"
              : "bg-primary text-primary-foreground rounded-br-sm"
          }
          ${isStreaming ? "animate-pulse" : ""}
        `}
      >
        <span className="whitespace-pre-wrap">{message.content}</span>
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-current rounded-sm ml-0.5 animate-pulse" />
        )}
      </div>
    </motion.div>
  );
}
