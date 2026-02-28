"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Search, Menu, X, User } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

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
  const { isNavOpen, toggleNav, closeNav } = useUIStore();
  const { user } = useAuthStore();

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
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between relative">
          {/* Left: Mobile Menu Toggle / Desktop Links */}
          <div className="flex items-center">
            <button
              onClick={toggleNav}
              className="lg:hidden flex items-center gap-2 text-sm uppercase tracking-widest"
              aria-label="Toggle Menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium hover:opacity-60 transition-opacity"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: Logo — absolutely centered so it never overlaps nav items */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="text-sm md:text-base font-display tracking-[0.3em] uppercase hover:opacity-60 transition-opacity whitespace-nowrap">
              Roselyra
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4 md:gap-6 text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium">
            <button onClick={() => router.push("/search")} className="hover:opacity-60 transition-opacity flex items-center gap-2" aria-label="Search">
              <Search className="w-4 h-4 hidden lg:block" strokeWidth={1.5} />
              <span className="hidden lg:block">Search</span>
            </button>
            <Link
              href={user ? "/account" : "/login"}
              className="hover:opacity-60 transition-opacity whitespace-nowrap"
              aria-label="Account"
            >
              {user ? "Account" : "Sign In"}
            </Link>
            <button
              onClick={openCart}
              className="relative hover:opacity-60 transition-opacity flex items-center gap-2"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4 hidden lg:block" strokeWidth={1.5} />
              <span>Bag {mounted && cartItemsCount > 0 ? `(${cartItemsCount})` : ""}</span>
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
                <Link href={user ? "/account" : "/login"} onClick={closeNav} className="hover:text-cream transition-colors">
                  Account
                </Link>
                <Link href="/wishlist" onClick={closeNav} className="hover:text-cream transition-colors">
                  Wishlist
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
