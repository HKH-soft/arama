import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { DashboardPageClient } from "@/components/DashboardPageClient";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    // Redirect to login if user is not authenticated
    redirect('/login');
  }
  
  return <DashboardPageClient user={user} />;
}