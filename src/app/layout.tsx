import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";

export const dynamic = "force-dynamic";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://roselyra.com"),
  title: {
    default: "ROSELYRA — Luxury Fashion",
    template: "%s | ROSELYRA",
  },
  description:
    "ROSELYRA — Editorial luxury fashion. Discover curated collections of timeless pieces crafted for the modern woman.",
  keywords: ["luxury fashion", "designer clothing", "editorial style", "ROSELYRA"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://roselyra.com",
    siteName: "ROSELYRA",
    title: "ROSELYRA — Luxury Fashion",
    description: "Editorial luxury fashion. Discover curated collections.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ROSELYRA — Luxury Fashion",
    description: "Editorial luxury fashion. Discover curated collections.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-cream text-noir">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
