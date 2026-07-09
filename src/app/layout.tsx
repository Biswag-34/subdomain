import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import Script from "next/script";

import { absoluteUrl, siteDescription, siteKeywords, siteName, siteUrl } from "@/lib/site";

import "./globals.css";

const bodyFont = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "Nikoo Homes 8 Bellahalli | Price, Brochure, Floor Plans & Site Visit",
    template: "%s | Nikoo Homes 8 Bellahalli",
  },
  description: siteDescription,
  keywords: siteKeywords,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Nikoo Homes 8 Bellahalli | Price, Brochure, Floor Plans & Site Visit",
    description: siteDescription,
    images: [
      {
        url: absoluteUrl("/nikoo/hero/goal-hero-1.png"),
        width: 1672,
        height: 941,
        alt: "Nikoo Homes 8 Bellahalli residential towers and landscaped amenities",
      },
    ],
    locale: "en_IN",
    siteName,
    type: "website",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Nikoo Homes 8 Bellahalli | Price, Brochure, Floor Plans & Site Visit",
    description: siteDescription,
    images: [absoluteUrl("/nikoo/hero/goal-hero-1.png")],
  },
  category: "real estate",
  other: {
    "geo.region": "IN-KA",
    "geo.placename": "Bellahalli, Bengaluru",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} antialiased`}
    >
      <body>
        <Script id="scroll-reset-guard" strategy="beforeInteractive">
          {`(() => {
            const resetScroll = () => {
              if (window.location.hash) return;
              window.scrollTo(0, 0);
              window.requestAnimationFrame(() => window.scrollTo(0, 0));
              window.setTimeout(() => window.scrollTo(0, 0), 240);
            };

            if ("scrollRestoration" in window.history) {
              window.history.scrollRestoration = "manual";
            }

            window.addEventListener("load", resetScroll, { once: true });
            window.addEventListener("pageshow", resetScroll);
          })();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
