"use client";

import { Plus, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export interface Conversation {
  id: number;
  title: string;
  createdAt: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onCreate: () => void;
  onDelete: (id: number) => void;
  isCreating?: boolean;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 2) return "همین الان";
  if (minutes < 60) return `${minutes} دقیقه پیش`;
  if (hours < 24) return `${hours} ساعت پیش`;
  if (days === 1) return "دیروز";
  return `${days} روز پیش`;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  isCreating,
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/[0.06] flex justify-between items-center shrink-0">
        <h2 className="font-semibold text-white text-sm">گفتگوهای من</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/[0.06]"
          onClick={onCreate}
          disabled={isCreating}
          data-testid="button-new-conversation"
          title="گفتگوی جدید"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <AnimatePresence initial={false}>
          {conversations.length === 0 && (
            <div className="text-center text-xs text-white/30 py-8">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>هنوز گفتگویی ندارید</p>
            </div>
          )}
          {conversations.map((conv) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className={`group relative p-3 rounded-lg cursor-pointer transition-colors flex flex-col gap-0.5
                ${conv.id === activeId
                  ? "bg-white/[0.08]"
                  : "hover:bg-white/[0.04]"
                }`}
              onClick={() => onSelect(conv.id)}
              data-testid={`conversation-item-${conv.id}`}
            >
              <span className={`text-xs font-medium truncate pl-5 ${conv.id === activeId ? "text-white" : "text-white/70"}`}>
                {conv.title}
              </span>
              <span className="text-[10px] text-white/30">{relativeTime(conv.createdAt)}</span>

              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-red-400 p-1 rounded"
                onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                data-testid={`button-delete-${conv.id}`}
                title="حذف"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
