"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUIStore } from "@/store/uiStore";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/ui/ProductCard";
import { Loader2, Search, X } from "lucide-react";
import { Product } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

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
      <DialogContent className="max-w-2xl w-full p-0 gap-0 bg-cream border-none">
        <div className="flex items-center border-b border-noir/10 p-4">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products..."
            className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground"
            autoFocus
          />
          <button onClick={handleClose} className="p-1 hover:opacity-60 transition-opacity">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : query && results.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No products found for &quot;{query}&quot;
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {results.slice(0, 4).map((product) => (
                  <div key={product.id} onClick={handleResultClick}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              {results.length > 4 && (
                <button
                  onClick={handleViewAll}
                  className="w-full py-3 text-sm uppercase tracking-wider border border-noir/20 hover:bg-noir hover:text-cream transition-colors"
                >
                  View all {results.length} results
                </button>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Start typing to search...
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
