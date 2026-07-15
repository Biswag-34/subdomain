import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import Script from "next/script";

import { absoluteUrl, siteDescription, siteKeywords, siteName, siteUrl } from "@/lib/site";

import "./globals.css";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

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
        url: absoluteUrl("/nikoo/hero/desktop-wide-upload.jpg"),
        width: 1659,
        height: 948,
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
    images: [absoluteUrl("/nikoo/hero/desktop-wide-upload.jpg")],
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
    <head>
    {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({
                'gtm.start': new Date().getTime(),
                event:'gtm.js'
              });
              var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),
                  dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>
    </head>
      <body>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5BVDMXBN"
height="0" width="0" style={{ display: "none", visibility: "hidden" }}></iframe></noscript>
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
