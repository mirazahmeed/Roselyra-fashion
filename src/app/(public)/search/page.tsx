"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/ui/ProductCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Loader2, Search, X } from "lucide-react";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [inputValue, setInputValue] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync our local state with URL search param
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&perPage=50`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data.items || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(query);
  }, [query, fetchResults]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    } else {
      router.push("/search");
    }
  };

  const clearSearch = () => {
    setInputValue("");
    router.push("/search");
  };

  return (
    <PageTransition>
      <div className="pt-32 pb-24 min-h-screen bg-cream">
        <div className="container mx-auto px-4 md:px-8">
          
          <ScrollReveal direction="up" distance={30}>
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Search className="w-4 h-4 text-noir/45" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-noir/45">
                  Boutique Collection Search
                </span>
              </div>
              
              <form onSubmit={handleSearchSubmit} className="relative mb-6">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="SEARCH FOR PIECES..."
                  className="w-full bg-transparent border-b-2 border-noir/15 focus:border-noir py-4 px-12 text-2xl md:text-3xl font-display text-center uppercase tracking-[0.1em] outline-none transition-all duration-300 placeholder:text-noir/20 text-noir"
                  autoFocus
                />
                {inputValue && (
                  <button 
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-noir/40 hover:text-noir transition-colors p-1"
                    aria-label="Clear query"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                )}
              </form>

              <p className="text-xs uppercase tracking-widest text-noir/50">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Searching boutique...
                  </span>
                ) : query ? (
                  `${products.length} product${products.length === 1 ? "" : "s"} found for "${query}"`
                ) : (
                  "Type a search term and press Enter"
                )}
              </p>
            </div>
          </ScrollReveal>

          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-noir/40" />
            </div>
          ) : !query.trim() ? (
            <div className="py-20 text-center max-w-md mx-auto">
              <p className="text-sm uppercase tracking-widest text-noir/40 mb-6">
                Discover our curated pieces or click below to browse the entire shop catalog.
              </p>
              <button
                onClick={() => router.push("/shop")}
                className="w-full py-4 text-xs uppercase tracking-[0.2em] font-bold bg-noir text-cream hover:bg-noir/90 transition-all duration-300"
              >
                Browse All Pieces
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center max-w-md mx-auto">
              <p className="text-sm uppercase tracking-widest text-noir/50 mb-6">
                We couldn't find matches for &quot;{query}&quot;.
              </p>
              <button
                onClick={() => router.push("/shop")}
                className="w-full py-4 text-xs uppercase tracking-[0.2em] font-bold bg-noir text-cream hover:bg-noir/90 transition-all duration-300"
              >
                Explore Curated Catalog
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

function SearchFallback() {
  return (
    <div className="pt-32 pb-24 min-h-screen bg-cream">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Search className="w-5 h-5 text-noir/30" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-noir/30">
              Boutique Collection Search
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display uppercase tracking-wider text-noir/20">
            Search
          </h1>
          <p className="text-xs uppercase tracking-widest text-noir/30 mt-2">Loading...</p>
        </div>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-noir/20" />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}
