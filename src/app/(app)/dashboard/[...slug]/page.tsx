import { getCurrentUser } from "@/lib/auth-helpers";
import { DashboardPageClient } from "@/components/DashboardPageClient";
export default async function DashboardCatchAll() {
  const user = await getCurrentUser();
  return <DashboardPageClient user={user} />;
}
