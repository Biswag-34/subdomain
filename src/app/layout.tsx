import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";

import "./globals.css";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title:
    "Nikoo Homes 8 Bellahalli | Price Sheet, Floor Plans, RERA, Brochure & Site Visit",
  description:
    "Explore Nikoo Homes 8 at Bhartiya Garden Enclave in Bellahalli near Thanisandra Main Road. Get latest pricing, floor plans, brochure, RERA details and guided site visit support.",
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
      <body>{children}</body>
    </html>
  );
}
