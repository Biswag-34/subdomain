import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import Script from "next/script";

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
  metadataBase: new URL("https://example.com"),
  title:
    "Nikoo Homes 8 Bellahalli | Price Sheet, Floor Plans, RERA, Brochure & Site Visit",
  description:
    "Explore Nikoo Homes 8 at Bhartiya Garden Enclave in Bellahalli near Thanisandra Main Road. Request price details, floor plans, brochure and site visit support.",
  alternates: {
    canonical: "https://example.com/",
  },
  openGraph: {
    title:
      "Nikoo Homes 8 Bellahalli | Price Sheet, Floor Plans, RERA, Brochure & Site Visit",
    description:
      "Explore Nikoo Homes 8 at Bhartiya Garden Enclave in Bellahalli near Thanisandra Main Road.",
    images: ["/nikoo/images/home_garden.jpg"],
    type: "website",
    url: "https://example.com/",
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
