"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { AuthUser } from "@/types/auth";
import { UserProvider } from "@/contexts/UserContext";

const DashboardShell = dynamic(
  () => import("@/components/DashboardShell").then((m) => m.DashboardShell),
  { ssr: false },
);

export function AppLayoutClient({
  user,
  children,
}: {
  user: AuthUser | null;
  children: React.ReactNode;
}) {
  // If user is null (not authenticated), redirect to login
  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
    }
  }, [user]);

  // If user is not loaded yet, don't render anything
  if (!user) {
    return null; // This will be redirected by useEffect
  }

  return (
    <UserProvider user={user}>
      <DashboardShell>{children}</DashboardShell>
    </UserProvider>
  );
}
