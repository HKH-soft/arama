import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { MeditationProvider } from "@/components/meditation-provider";
import { AmbientProvider } from "@/components/ambient-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const iransans = localFont({
  src: [
    { path: "../../public/fonts/IRANSans-UltraLight [@ClubEdits].woff2", weight: "200", style: "normal" },
    { path: "../../public/fonts/IRANSans-Light [@ClubEdits].woff2", weight: "300", style: "normal" },
    { path: "../../public/fonts/IRANSans [@ClubEdits].woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/IRANSans-Medium [@ClubEdits].woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/IRANSans-Bold [@ClubEdits].woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/IRANSans-Black [@ClubEdits].woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-iransans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "آراما — همراه هوشمند سلامت روان",
    template: "%s | آراما",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://arama.life"),
  alternates: {
    canonical: "/",
  },
  description:
    "آراما یک همراه هوشمند سلامت روان است؛ گفتگوی همدلانه با هوش مصنوعی، ردیابی خلق‌وخو، مدیتیشن هدایت‌شده و تمرین‌های درمانی — در فضایی امن، گرم و بدون قضاوت.",
  keywords: [
    "آراما",
    "aramaho",
    "arama",
    "سلامت روان",
    "تراپی آنلاین",
    "تراپی آنلاین هوش مصنوعی",
    "بعد از حمله پانیک چه کنیم",
    "آموزش غلبه بر تنبلی و اهمال کاری",
    "تنهایی",
    "احساس تنهایی",
    "eq",
    "هوش هیجانی",
    "مدیتیشن",
    "کاهش اضطراب",
    "چت بات سلامت روان",
  ],
  openGraph: {
    title: "آراما — همراه هوشمند سلامت روان و تراپی آنلاین",
    description: "گفتگوی همدلانه، مدیتیشن هدایت‌شده و تمرین‌های درمانی در فضایی امن و گرم.",
    url: "https://arama.life",
    siteName: "آراما",
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
    title: "آراما — همراه هوشمند سلامت روان و تراپی آنلاین",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
      "@type": "WebSite",
      "@id": "https://arama.life/#website",
      "url": "https://arama.life",
      "name": "آراما",
      "alternateName": ["Arama", "Aramaho", "آراماهو", "arama.life"],
      "description": "همراه هوشمند سلامت روان، تراپی آنلاین فارسی، تمرین‌های ذهن‌آگاهی و مدیتیشن",
      "inLanguage": "fa-IR",
    },
    {
      "@type": "Organization",
      "@id": "https://arama.life/#organization",
      "name": "آراما",
      "alternateName": ["Arama", "Aramaho"],
      "url": "https://arama.life",
      "logo": "https://arama.life/icon-192.png",
      "sameAs": ["https://instagram.com/arama.life", "https://t.me/arama_life"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://arama.life/#software",
      "name": "آراما — همراه هوشمند سلامت روان",
      "alternateName": ["Arama App", "Aramaho"],
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Web",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1420",
        "bestRating": "5",
        "worstRating": "1",
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "IRR",
      },
    },
    {
      "@type": "MedicalWebPage",
      "@id": "https://arama.life/#medical",
      "url": "https://arama.life",
      "name": "راهنمای سلامت روان و آرامش ذهن آراما",
      "inLanguage": "fa-IR",
      "about": [
        {
          "@type": "MedicalCondition",
          "name": "اضطراب و استرس",
          "alternateName": "Anxiety & Stress",
        },
        {
          "@type": "MedicalCondition",
          "name": "حمله پانیک",
          "alternateName": "Panic Attack",
        },
        {
          "@type": "MedicalCondition",
          "name": "احساس تنهایی و انزوای عاطفی",
          "alternateName": "Loneliness",
        },
        {
          "@type": "MedicalTherapy",
          "name": "تمرین‌های ذهن‌آگاهی و تنفس آرامش‌بخش",
          "alternateName": "Mindfulness & Breathwork",
        },
      ],
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
      <body className={`${iransans.variable} font-sans antialiased`}>
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-deep focus:text-onbrand focus:font-bold focus:rounded-b-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand"
        >
          رد شدن به محتوای اصلی
        </a>
        <AmbientProvider>
          <MeditationProvider>{children}</MeditationProvider>
        </AmbientProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
