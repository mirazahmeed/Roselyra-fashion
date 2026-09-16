"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Search, Menu, X, User } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { MagneticButton } from "@/components/animations/MagneticButton";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const BASE_NAV_LINKS = [
  { href: "/collections", label: "Collections" },
  { href: "/shop", label: "Shop" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const cartItemsCount = useCartStore((s) => s.totalItems());
  const { openCart } = useCartStore();
  const { isNavOpen, toggleNav, closeNav, openSearch } = useUIStore();
  const { user, isAdmin } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories?perPage=10");
        const json = await res.json();
        if (json.success && json.data.items) {
          const cats = json.data.items as Array<{ id: string; name: string; slug: string; parentId: string | null }>;
          setCategories(cats.filter((c) => !c.parentId));
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const navLinks = [
    ...BASE_NAV_LINKS,
    ...categories.slice(0, 4).map((cat) => ({
      href: `/categories/${cat.slug}`,
      label: cat.name,
    })),
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    closeNav();
  }, [pathname, closeNav]);

  const isLight = false;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-cream/90 backdrop-blur-md py-4 shadow-sm" : "bg-transparent py-6"
        } ${isLight && !scrolled ? "text-cream" : "text-noir"}`}
      >
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-[1fr_auto_1fr] items-center">
          {/* Left: Mobile Menu Toggle / Desktop Links */}
          <div className="flex items-center justify-start min-w-0 pr-4">
            <button
              onClick={toggleNav}
              className="xl:hidden flex items-center gap-2 text-sm uppercase tracking-widest hover:opacity-60 transition-opacity flex-shrink-0"
              aria-label="Toggle Menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <nav className="hidden xl:flex items-center gap-4 2xl:gap-6 min-w-0">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[10px] 2xl:text-xs uppercase tracking-[0.15em] 2xl:tracking-[0.2em] font-medium hover:opacity-60 transition-opacity line-draw whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            {/* Intermediate screen (lg: 1024px-1279px): show primary links alongside menu button */}
            <nav className="hidden lg:flex xl:hidden items-center gap-4 ml-4 min-w-0">
              <Link
                href="/collections"
                className="text-[10px] uppercase tracking-[0.15em] font-medium hover:opacity-60 transition-opacity line-draw whitespace-nowrap"
              >
                Collections
              </Link>
              <Link
                href="/shop"
                className="text-[10px] uppercase tracking-[0.15em] font-medium hover:opacity-60 transition-opacity line-draw whitespace-nowrap"
              >
                Shop
              </Link>
            </nav>
          </div>

          {/* Center: Logo — in its own grid column, guaranteed never to overlap */}
          <div className="flex items-center justify-center px-2 sm:px-4">
            <MagneticButton strength={0.15}>
              <Link href="/" className="text-sm md:text-base font-display tracking-[0.3em] uppercase hover:opacity-60 transition-opacity whitespace-nowrap text-center block">
                Roselyra
              </Link>
            </MagneticButton>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-3 sm:gap-4 md:gap-6 text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] font-medium min-w-0 pl-4">
            <button onClick={openSearch} className="hover:opacity-60 transition-opacity flex items-center gap-1.5 md:gap-2 flex-shrink-0" aria-label="Search">
              <Search className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden md:inline-block">Search</span>
            </button>
            <Link
              href={user && !isAdmin() ? "/account" : "/login"}
              className="hover:opacity-60 transition-opacity whitespace-nowrap flex-shrink-0"
              aria-label="Account"
            >
              {user && !isAdmin() ? "Account" : "Sign In"}
            </Link>
            <button
              onClick={openCart}
              className="relative hover:opacity-60 transition-opacity flex items-center gap-1.5 md:gap-2 flex-shrink-0"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4 hidden lg:block" strokeWidth={1.5} />
              <span className="whitespace-nowrap">Bag {mounted && cartItemsCount > 0 ? `(${cartItemsCount})` : ""}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Full Screen Mobile Navigation */}
      <AnimatePresence>
        {isNavOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-[60] bg-noir text-cream flex flex-col"
          >
            <div className="flex items-center justify-between p-4 md:p-8">
              <Link href="/" className="text-2xl font-display tracking-[0.2em] uppercase" onClick={closeNav}>
                Roselyra
              </Link>
              <button
                onClick={closeNav}
                className="flex items-center gap-2 text-sm uppercase tracking-widest hover:opacity-60 transition-opacity"
              >
                Close <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                >
                  <Link
                    href={link.href}
                    onClick={closeNav}
                    className="text-3xl md:text-5xl font-display uppercase tracking-widest hover:text-rose transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
                className="mt-8 flex gap-8 text-sm uppercase tracking-widest text-cream/60"
              >
                {user && !isAdmin() && (
                  <Link href="/account" onClick={closeNav} className="hover:text-cream transition-colors">
                    Account
                  </Link>
                )}
                <Link href="/wishlist" onClick={closeNav} className="hover:text-cream transition-colors">
                  Wishlist
                </Link>
                <button
                  onClick={() => {
                    closeNav();
                    openSearch();
                  }}
                  className="hover:text-cream transition-colors flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  Search
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
