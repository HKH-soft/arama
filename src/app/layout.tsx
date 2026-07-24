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
    url: "https://arama.life",
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://arama.life/#organization",
      "name": "آراما",
      "url": "https://arama.life",
      "logo": "https://arama.life/icon-192.png",
      "sameAs": ["https://instagram.com/arama.life", "https://t.me/arama_life"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://arama.life/#software",
      "name": "آراما — همراه هوشمند سلامت روان",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "IRR",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${vazirmatn.variable} font-sans antialiased`}>
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-deep focus:text-onbrand focus:font-bold focus:rounded-b-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand"
        >
          رد شدن به محتوای اصلی
        </a>
        <AmbientProvider>
          <MeditationProvider>{children}</MeditationProvider>
        </AmbientProvider>
      </body>
    </html>
  );
}
