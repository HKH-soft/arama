import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { ChatExperience } from "@/components/chat-experience";

export const metadata: Metadata = {
  title: "گفتگوی همدلانه",
  description: "گفتگوی ۲۴ ساعته با همراه هوشمند سلامت روان آراما؛ شنوندهٔ بی‌قضاوت و امن شما.",
};

function ChatLoading() {
  return (
    <div className="flex h-dvh flex-col">
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <div className="calm-skeleton size-11 rounded-full" />
        <div>
          <div className="calm-skeleton h-4 w-32 rounded-full" />
          <div className="calm-skeleton mt-2 h-3 w-48 rounded-full" />
        </div>
      </div>
      <div className="flex-1 px-5 py-8">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="calm-skeleton mx-auto h-6 w-16 rounded-full" />
          <div className="calm-skeleton h-20 w-3/4 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <AppShell>
      <Suspense fallback={<ChatLoading />}>
        <ChatExperience />
      </Suspense>
    </AppShell>
  );
}
