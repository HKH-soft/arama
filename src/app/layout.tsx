import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { MeditationProvider } from "@/components/meditation-provider";
import { AmbientProvider } from "@/components/ambient-provider";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "آراما — همراه هوشمند سلامت روان",
    template: "%s | آراما",
  },
  description:
    "آراما یک همراه هوشمند سلامت روان است؛ گفتگوی همدلانه با هوش مصنوعی، ردیابی خلق‌وخو، مدیتیشن هدایت‌شده و تمرین‌های درمانی — در فضایی امن، گرم و بدون قضاوت.",
  keywords: ["سلامت روان", "مدیتیشن", "تراپی آنلاین", "آرامش", "هوش مصنوعی", "چت بات", "مدیریت اضطراب"],
  openGraph: {
    title: "آراما — همراه هوشمند سلامت روان",
    description: "گفتگوی همدلانه، مدیتیشن هدایت‌شده و تمرین‌های درمانی در فضایی امن و گرم.",
    url: "https://arama.app",
    siteName: "Arama",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Arama App",
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "آراما — همراه هوشمند سلامت روان",
    description: "گفتگوی همدلانه، مدیتیشن هدایت‌شده و تمرین‌های درمانی در فضایی امن و گرم.",
    images: ["/images/og-image.jpg"],
  },
};

const themeInit = `
(function () {
  try {
    var stored = localStorage.getItem("arama-theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={`${vazirmatn.variable} font-sans antialiased`}>
        <AmbientProvider>
          <MeditationProvider>{children}</MeditationProvider>
        </AmbientProvider>
      </body>
    </html>
  );
}
