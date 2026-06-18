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
  title: "Nikoo Homes 8 | North Bengaluru Launch Experience",
  description:
    "Lead-focused, high-design real estate landing page for Nikoo Homes 8 at Bhartiya Garden Enclave.",
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
