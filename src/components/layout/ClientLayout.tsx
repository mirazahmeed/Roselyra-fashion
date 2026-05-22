"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/ui/CartDrawer";
import { LenisProvider } from "@/components/animations/LenisProvider";
import { Toaster } from "react-hot-toast";
import { SearchModal } from "@/components/ui/SearchModal";
import { WelcomeOfferPopup } from "@/components/ui/WelcomeOfferPopup";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <LenisProvider>
      {!isAdminRoute && <Navbar />}
      <main>{children}</main>
      {!isAdminRoute && <Footer />}
      <CartDrawer />
      <SearchModal />
      {!isAdminRoute && <WelcomeOfferPopup discountPercent={10} />}
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
  );
}

