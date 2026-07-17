import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { MeditationProvider } from "@/components/meditation-provider";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "آراما — همراه هوشمند سلامت روان",
    template: "%s — آراما",
  },
  description:
    "آراما یک همراه هوشمند سلامت روان است؛ گفتگوی همدلانه با هوش مصنوعی، ردیابی خلق‌وخو، مدیتیشن هدایت‌شده و تمرین‌های درمانی — در فضایی امن، گرم و بدون قضاوت.",
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
        <MeditationProvider>{children}</MeditationProvider>
      </body>
    </html>
  );
}
