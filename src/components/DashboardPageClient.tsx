"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/types/auth";

type SessionPayload = { id?: string; name?: string | null; email?: string | null; image?: string | null; roles?: string[] };

const DashboardContent = dynamic(
  () => import("@/components/DashboardContent").then((m) => m.DashboardContent),
  { ssr: false },
);

export function DashboardPageClient({ user }: { user: SessionPayload | null }) {
  const router = useRouter();

  // If user is null (not authenticated), redirect to login
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // If user is not loaded yet, show nothing or a loading state
  if (!user) {
    return null; // This will be redirected by useEffect
  }

  return <DashboardContent user={user} />;
}