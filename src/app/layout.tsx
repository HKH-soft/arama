import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import Script from "next/script";
import { headers } from "next/headers";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "آراما — هوش مصنوعی سلامت روان",
  description:
    "آراما — هم‌صحبت امن روزهای سخت. دستیار هوشمند سلامت روان که همیشه در کنار توست.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "آراما — هوش مصنوعی سلامت روان",
    description:
      "آراما — هم‌صحبت امن روزهای سخت. دستیار هوشمند سلامت روان که همیشه در کنار توست.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "آراما — هوش مصنوعی سلامت روان",
    description:
      "آراما — هم‌صحبت امن روزهای سخت. دستیار هوشمند سلامت روان که همیشه در کنار توست.",
  },
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get nonce from proxy middleware
  const nonce = (await headers()).get("x-nonce");

  return (
    <html
      lang="fa"
      dir="rtl"
      suppressHydrationWarning
      className={vazirmatn.variable}
      nonce={nonce ?? undefined}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          storageKey="arama-theme"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
