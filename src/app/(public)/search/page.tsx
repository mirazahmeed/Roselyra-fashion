"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/ui/ProductCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Loader2, Search } from "lucide-react";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    if (!query.trim()) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&perPage=50`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data.items || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <PageTransition>
      <div className="pt-32 pb-24 min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal direction="up" distance={30}>
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Search className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm uppercase tracking-widest text-muted-foreground">Search Results</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-display uppercase tracking-wider">
                {query ? `"${query}"` : "Search"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isLoading
                  ? "Searching..."
                  : `${products.length} product${products.length === 1 ? "" : "s"} found for "${query}"`}
              </p>
            </div>
          </ScrollReveal>

          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="py-32 text-center">
              <p className="text-muted-foreground mb-6">
                {query ? `No products found for "${query}"` : "Enter a search term to find products"}
              </p>
              <button
                onClick={() => router.push("/shop")}
                className="btn-luxury-dark inline-block"
              >
                Browse All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6">
              {products.map((product, idx) => (
                <ScrollReveal
                  key={product.id}
                  direction="up"
                  delay={0.05 * (idx % 8)}
                >
                  <ProductCard product={product} priority={idx < 8} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
