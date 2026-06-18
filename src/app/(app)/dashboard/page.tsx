"use client";

import dynamic from "next/dynamic";

const DashboardContent = dynamic(
  () => import("@/components/DashboardContent").then((m) => m.DashboardContent),
  { ssr: false }
);

export default function DashboardPage() {
  return <DashboardContent />;
}
