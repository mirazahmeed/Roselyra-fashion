import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { LenisProvider } from "@/components/animations/LenisProvider";
import { Toaster } from "react-hot-toast";
import { SearchModal } from "@/components/ui/SearchModal";

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
        <LenisProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <SearchModal />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#0A0A0A",
                color: "#F5F0EB",
                fontFamily: "var(--font-inter)",
                fontSize: "0.8125rem",
                letterSpacing: "0.03em",
                borderRadius: "2px",
              },
            }}
          />
        </LenisProvider>
      </body>
    </html>
  );
}
