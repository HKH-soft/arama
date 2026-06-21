"use client";

import { useState, useCallback, useRef } from "react";
import type { Message } from "@/components/chat/ChatMessage";
import type { Conversation } from "@/components/chat/ConversationList";

function makeId() {
  return Math.random().toString(36).slice(2);
}

const BASE = "/api";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/chat/conversations`);
      if (res.ok) setConversations(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (title: string): Promise<Conversation | null> => {
    const res = await fetch(`${BASE}/chat/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) return null;
    const conv: Conversation = await res.json();
    setConversations((prev) => [conv, ...prev]);
    return conv;
  }, []);

  const remove = useCallback(async (id: number) => {
    await fetch(`${BASE}/chat/conversations/${id}`, { method: "DELETE" });
    setConversations((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { conversations, loading, load, create, remove };
}

export function useMessages(conversationId: number | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (id: number) => {
    const res = await fetch(`${BASE}/chat/conversations/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setMessages(
      (data.messages ?? []).map((m: { id: number; role: string; content: string; createdAt: string }) => ({
        id: String(m.id),
        role: m.role as "user" | "assistant",
        content: m.content,
        createdAt: new Date(m.createdAt),
      }))
    );
  }, []);

  const send = useCallback(
    async (content: string, overrideConvId?: number) => {
      // We should allow sending if we have either conversationId or overrideConvId
      // The original logic was correct, but let's add better error handling
      const effectiveId = overrideConvId ?? conversationId;
      
      // If neither is available, we can't send the message
      if (!effectiveId) {
        console.warn("No conversation ID available to send message");
        return;
      }
      
      if (isStreaming) {
        console.warn("Already streaming a message, ignoring new send request");
        return;
      }

      const userMsg: Message = { id: makeId(), role: "user", content };
      setMessages((prev) => [...prev, userMsg]);

      const streamingId = makeId();
      setMessages((prev) => [...prev, { id: streamingId, role: "assistant", content: "" }]);
      setIsStreaming(true);

      abortRef.current = new AbortController();

      try {
        const res = await fetch(`${BASE}/chat/conversations/${effectiveId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamingId
                ? { ...m, content: "متأسفم، خطایی رخ داد. لطفاً دوباره تلاش کن." }
                : m
            )
          );
          setIsStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const json = JSON.parse(line.slice(6));
              if (json.content) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === streamingId ? { ...m, content: m.content + json.content } : m
                  )
                );
              }
              if (json.done || json.error) {
                if (json.error) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === streamingId ? { ...m, content: json.error } : m
                    )
                  );
                }
              }
            } catch {}
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamingId
                ? { ...m, content: "ارتباط قطع شد. لطفاً دوباره تلاش کن." }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [conversationId, isStreaming]
  );

  const clear = useCallback(() => setMessages([]), []);

  return { messages, isStreaming, send, load, clear };
}