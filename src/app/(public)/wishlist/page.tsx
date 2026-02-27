"use client";

import { useWishlistStore } from "@/store/wishlistStore";
import { ProductCard } from "@/components/ui/ProductCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  const { items } = useWishlistStore();
  const products = items;

  return (
    <PageTransition>
      <div className="pt-32 pb-24 min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal direction="up" distance={30}>
            <h1 className="text-4xl md:text-6xl font-display uppercase tracking-wider mb-6 text-center">
              Wishlist
            </h1>
          </ScrollReveal>

          {products.length === 0 ? (
            <div className="py-32 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted uppercase tracking-widest mb-2">
                Your wishlist is empty
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Save your favorite pieces to revisit later.
              </p>
              <Link
                href="/shop"
                className="btn-luxury-dark inline-block"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6">
              {products.map((product, idx) => (
                <ScrollReveal
                  key={product.id}
                  direction="up"
                  delay={0.05 * (idx % 8)}
                >
                  <ProductCard product={product} priority={idx < 4} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
