import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth-helpers";
import { UserProvider } from "@/contexts/UserContext";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <UserProvider user={user}>
        <Navbar user={user} />
      </UserProvider>
      <main className="flex-grow pt-20">{children}</main>
      <Footer />
    </div>
  );
}
