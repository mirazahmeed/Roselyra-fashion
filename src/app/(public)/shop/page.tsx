"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/ui/ProductCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product, Category, Collection } from "@/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const sortOptions = [
  { value: "order", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const category = searchParams.get("category");
  const collection = searchParams.get("collection");
  const sort = searchParams.get("sort") || "order";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (collection) params.set("collection", collection);
      if (sort) params.set("sort", sort);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      params.set("perPage", "50");

      const [productsRes, categoriesRes, collectionsRes] = await Promise.all([
        fetch(`/api/products?${params}`),
        fetch("/api/categories"),
        fetch("/api/collections"),
      ]);

      const [productsJson, categoriesJson, collectionsJson] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        collectionsRes.json(),
      ]);

      if (productsJson.success) setProducts(productsJson.data.items || []);
      if (categoriesJson.success) setCategories(categoriesJson.data.items || []);
      if (collectionsJson.success) setCollections(collectionsJson.data.items || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [category, collection, sort, minPrice, maxPrice]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/shop");
  };

  const hasFilters = category || collection || minPrice || maxPrice;

  return (
    <PageTransition>
      <div className="pt-32 pb-24 min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal direction="up" distance={30}>
            <h1 className="text-4xl md:text-6xl font-display uppercase tracking-wider mb-6 text-center">
              Shop
            </h1>
          </ScrollReveal>

          <div className="flex items-center justify-between mb-12 border-b border-noir/10 pb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsFilterOpen(true)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasFilters && (
                  <span className="w-5 h-5 bg-noir text-cream rounded-full text-xs flex items-center justify-center">
                    !
                  </span>
                )}
              </Button>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs uppercase tracking-wider text-muted-foreground hover:text-noir transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground hidden md:block">
                Sort by:
              </span>
              <select
                value={sort}
                onChange={(e) => updateParams("sort", e.target.value)}
                className="text-sm uppercase tracking-wider bg-transparent border-none focus:outline-none cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="py-32 text-center">
              <p className="text-muted uppercase tracking-widest mb-4">No products found</p>
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
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

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
          isFilterOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsFilterOpen(false)}
      >
        <div
          className={cn(
            "absolute right-0 top-0 h-full w-full max-w-md bg-cream shadow-xl transition-transform duration-300 overflow-y-auto",
            isFilterOpen ? "translate-x-0" : "translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-noir/10 flex items-center justify-between sticky top-0 bg-cream z-10">
            <h2 className="text-lg font-display uppercase tracking-wider">Filters</h2>
            <button onClick={() => setIsFilterOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-medium mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => updateParams("category", null)}
                  className={cn(
                    "block text-sm w-full text-left py-1 transition-colors",
                    !category ? "font-medium" : "text-muted-foreground hover:text-noir"
                  )}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateParams("category", cat.slug)}
                    className={cn(
                      "block text-sm w-full text-left py-1 transition-colors",
                      category === cat.slug
                        ? "font-medium"
                        : "text-muted-foreground hover:text-noir"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-widest font-medium mb-4">Collections</h3>
              <div className="space-y-2">
                <button
                  onClick={() => updateParams("collection", null)}
                  className={cn(
                    "block text-sm w-full text-left py-1 transition-colors",
                    !collection ? "font-medium" : "text-muted-foreground hover:text-noir"
                  )}
                >
                  All Collections
                </button>
                {collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => updateParams("collection", col.slug)}
                    className={cn(
                      "block text-sm w-full text-left py-1 transition-colors",
                      collection === col.slug
                        ? "font-medium"
                        : "text-muted-foreground hover:text-noir"
                    )}
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-widest font-medium mb-4">Price Range</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice || ""}
                  onChange={(e) => updateParams("minPrice", e.target.value || null)}
                  className="w-full px-3 py-2 border border-noir/20 text-sm"
                />
                <span className="text-muted-foreground">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice || ""}
                  onChange={(e) => updateParams("maxPrice", e.target.value || null)}
                  className="w-full px-3 py-2 border border-noir/20 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-noir/10 sticky bottom-0 bg-cream">
            <Button className="w-full" onClick={() => setIsFilterOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function ShopFallback() {
  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="text-4xl md:text-6xl font-display uppercase tracking-wider mb-6 text-center">
          Shop
        </h1>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopContent />
    </Suspense>
  );
}
