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
      className={`flex items-end gap-3 ${isAI ? "justify-content-end flex-row-reverse" : "flex-row justify-start"}`}
      data-testid={`message-${message.role}-${message.id}`}
    >
      {/* Avatar */}
      {isAI ? (
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0 shadow-md">
          <Brain className="w-4 h-4" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-[10px] font-medium text-muted-foreground shrink-0">
          شما
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[85%] sm:max-w-[72%] px-4 py-3 text-sm leading-7 rounded-2xl shadow-sm
          ${isAI
            ? "bg-background text-foreground rounded-bl-sm"
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
