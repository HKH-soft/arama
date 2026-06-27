import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth-helpers";


export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar user={user} />
      <main className="flex-grow pt-20">{children}</main>
      <Footer />
    </div>
  );
}