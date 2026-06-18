import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nikoo Homes 8 Thanisandra | Price Sheet, Floor Plans & Site Visit",
  description:
    "Explore Nikoo Homes 8 at Bhartiya Garden Enclave, North Bengaluru. View configurations, floor plans, RERA details, price guidance, amenities, location and site visit options.",
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
