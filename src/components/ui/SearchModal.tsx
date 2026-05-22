"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUIStore } from "@/store/uiStore";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Search, X, ArrowRight } from "lucide-react";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";

function SearchModalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSearchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&perPage=8`);
      const json = await res.json();
      if (json.success) {
        setResults(json.data.items || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchProducts(query);
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, searchProducts]);

  const handleClose = () => {
    closeSearch();
    setQuery("");
    setResults([]);
  };

  const handleResultClick = () => {
    handleClose();
  };

  const handleViewAll = () => {
    handleClose();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <Dialog open={isSearchOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl w-full p-0 gap-0 bg-cream border-none overflow-hidden rounded-none shadow-2xl">
        {/* Search Input Area */}
        <div className="flex items-center border-b border-noir/10 p-5 bg-cream">
          <Search className="w-5 h-5 text-noir/40 mr-3" strokeWidth={1.5} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search our collections..."
            className="flex-1 bg-transparent border-none outline-none text-xl font-display uppercase tracking-wider placeholder:text-noir/30 text-noir"
            autoFocus
          />
          <button 
            onClick={handleClose} 
            className="p-1 text-noir/40 hover:text-noir transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-6 bg-cream/90 backdrop-blur-md">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-noir/60" />
              <span className="text-[10px] uppercase tracking-widest text-noir/40">Searching...</span>
            </div>
          ) : query && results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm uppercase tracking-widest text-noir/60">
                No pieces found for &quot;{query}&quot;
              </p>
              <p className="text-xs text-noir/40 mt-1">Try refining your terms or check spelling.</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-noir/5 pb-2">
                <span className="text-[10px] uppercase tracking-widest text-noir/40 font-bold">
                  Suggested Pieces
                </span>
                <span className="text-[9px] uppercase tracking-widest text-noir/30">
                  {results.length} matches
                </span>
              </div>

              <div className="divide-y divide-noir/5 max-h-[40vh] overflow-y-auto pr-1 space-y-1">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-4 py-3 group hover:bg-noir/[0.02] px-2 transition-all duration-300 -mx-2"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-12 h-16 bg-[#f5f5f5] overflow-hidden flex-shrink-0 border border-noir/5">
                      {product.images?.[0]?.url ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[7px] text-noir/30 uppercase font-bold">
                          No Img
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs uppercase tracking-wider font-semibold text-noir truncate group-hover:text-rose-700 transition-colors">
                        {product.name}
                      </h4>
                      {product.category?.name && (
                        <p className="text-[8px] uppercase tracking-widest text-noir/45 mt-0.5 font-medium">
                          {product.category.name}
                        </p>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-noir">${product.price.toFixed(2)}</p>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <p className="text-[9px] text-noir/35 line-through mt-0.5">
                          ${product.comparePrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* View All Button */}
              <button
                onClick={handleViewAll}
                className="w-full py-4 text-xs uppercase tracking-[0.2em] font-bold bg-noir text-cream hover:bg-noir/90 transition-all duration-300 flex items-center justify-center gap-2 mt-4"
              >
                View all results <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="py-16 text-center">
              <span className="text-[10px] uppercase tracking-[0.2em] text-noir/45 font-bold block mb-4">
                What are you looking for today?
              </span>
              <div className="flex flex-wrap justify-center gap-3 max-w-md mx-auto">
                {["Dresses", "Bags", "Accessories", "New Arrivals"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="text-[10px] uppercase tracking-widest border border-noir/10 px-3 py-1.5 hover:bg-noir hover:text-cream hover:border-noir transition-all duration-300 text-noir/60"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SearchModalFallback() {
  return null;
}

export function SearchModal() {
  return (
    <Suspense fallback={<SearchModalFallback />}>
      <SearchModalContent />
    </Suspense>
  );
}
