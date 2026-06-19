"use client";

import dynamic from "next/dynamic";

const DashboardShell = dynamic(
  () => import("@/components/DashboardShell").then((m) => m.DashboardShell),
  { ssr: false },
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
