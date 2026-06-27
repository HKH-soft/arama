import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { AppLayoutClient } from "@/components/AppLayoutClient";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // If user is not authenticated, redirect to login page
  if (!user) {
    redirect('/login');
  }

  return <AppLayoutClient user={user}>{children}</AppLayoutClient>;
}