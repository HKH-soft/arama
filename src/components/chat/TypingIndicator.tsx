"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-end gap-3"
      data-testid="typing-indicator"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shrink-0 shadow-md">
        <Brain className="w-4 h-4" />
      </div>
      <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-br-sm shadow-sm flex gap-1.5 items-center h-11">
        {[0, 0.18, 0.36].map((delay, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 0.7, delay, ease: "easeInOut" }}
            className="w-2 h-2 bg-primary/60 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
}
