"use client";

import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem, openCart } = useCartStore();
  const { toggleItem, isWishlisted } = useWishlistStore();
  const { user } = useAuthStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes?.[0] || null);
  const [selectedColor, setSelectedColor] = useState<string | null>(product.colors?.[0] || null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

  const images = [...(product.images || [])].sort((a, b) => a.order - b.order);
  const wishlisted = isWishlisted(product.id);

  const scrollToImage = useCallback((idx: number) => {
    setSelectedImageIndex(idx);
    const el = carouselRef.current;
    if (el) {
      isProgrammaticScroll.current = true;
      el.scrollTo({ left: el.clientWidth * idx, behavior: "smooth" });
      setTimeout(() => { isProgrammaticScroll.current = false; }, 400);
    }
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onScroll = () => {
      if (isProgrammaticScroll.current) return;
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      if (idx !== selectedImageIndex && idx >= 0 && idx < images.length) {
        setSelectedImageIndex(idx);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [selectedImageIndex, images.length]);

  const getAvailableStock = () => {
    if (!selectedColor && !selectedSize) return product.stock;
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants.find((v) => v.color === selectedColor && v.size === selectedSize);
      if (variant) return variant.stock;
    }
    return product.stock;
  };

  const availableStock = getAvailableStock();

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) { toast.error("Please select a size"); return; }
    if (product.colors?.length && !selectedColor) { toast.error("Please select a color"); return; }
    if (availableStock < 1) { toast.error("Selected variant is sold out"); return; }
    addItem(product, quantity, selectedSize, selectedColor);
    toast.success("Added to bag");
    openCart();
  };

  const handleBuyNow = () => {
    if (product.sizes?.length && !selectedSize) { toast.error("Please select a size"); return; }
    if (product.colors?.length && !selectedColor) { toast.error("Please select a color"); return; }
    if (availableStock < 1) { toast.error("Selected variant is sold out"); return; }
    addItem(product, 1, selectedSize, selectedColor);
    if (!user) router.push("/login?redirect=/checkout");
    else router.push("/checkout");
  };

  return (
    <div className="pt-24 pb-20 md:pt-32 bg-cream text-noir min-h-screen animate-[fadeIn_0.4s_ease]">
      <div className="w-full px-2 md:px-4">
        <div className="flex flex-col md:flex-row gap-4 lg:gap-8 relative">
          <div className="w-full md:w-1/2 flex flex-col gap-2 order-1">
            {images.length > 0 ? (
              <>
                <div ref={carouselRef} className="flex md:hidden overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar w-full">
                  {images.map((img, idx) => (
                    <div key={img.id} className="min-w-full snap-start relative aspect-[3/4] bg-[#F5F5F5] flex-shrink-0">
                      <Image
                        src={img.url}
                        alt={img.altText || `${product.name} detail ${idx + 1}`}
                        fill
                        priority={idx === 0}
                        fetchPriority={idx === 0 ? "high" : "auto"}
                        sizes="100vw"
                        loading={idx === 0 ? "eager" : "lazy"}
                        className="object-cover"
                      />
                      <span className="absolute bottom-3 right-3 bg-noir/70 text-cream text-[10px] tracking-widest px-2 py-1 rounded-full">
                        {idx + 1}/{images.length}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex md:hidden gap-2 overflow-x-auto no-scrollbar py-2">
                  {images.map((img, idx) => (
                    <button
                      key={`thumb-m-${img.id}`}
                      onClick={() => scrollToImage(idx)}
                      className={cn("relative w-16 h-20 flex-shrink-0 overflow-hidden border-2 transition-colors", selectedImageIndex === idx ? "border-noir" : "border-transparent opacity-70")}
                    >
                      <Image src={img.url} alt={img.altText || `thumb ${idx + 1}`} fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>

                <div className="hidden md:flex lg:hidden flex-col gap-3">
                  <div className="relative aspect-[3/4] bg-[#F5F5F5] w-full overflow-hidden">
                    <Image
                      src={images[selectedImageIndex]?.url || images[0].url}
                      alt={images[selectedImageIndex]?.altText || product.name}
                      fill
                      priority
                      fetchPriority="high"
                      sizes="(max-width: 1023px) 50vw, 50vw"
                      className="object-cover"
                    />
                    {images.length > 1 && (
                      <span className="absolute bottom-3 right-3 bg-noir/70 text-cream text-[10px] tracking-widest px-2 py-1 rounded-full">
                        {selectedImageIndex + 1}/{images.length}
                      </span>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                      {images.map((img, idx) => (
                        <button
                          key={`thumb-md-${img.id}`}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={cn("relative w-16 h-20 flex-shrink-0 overflow-hidden border-2 transition-colors", selectedImageIndex === idx ? "border-noir" : "border-transparent opacity-70 hover:opacity-100")}
                        >
                          <Image src={img.url} alt={img.altText || `thumb ${idx + 1}`} fill className="object-cover" sizes="64px" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden lg:flex flex-col gap-2">
                  {images.map((img, idx) => {
                    if (idx === 0) {
                      return (
                        <div key={img.id} className="w-full relative aspect-[3/4] bg-[#F5F5F5]">
                          <Image
                            src={img.url}
                            alt={img.altText || `${product.name} detail ${idx + 1}`}
                            fill
                            priority
                            fetchPriority="high"
                            sizes="(max-width: 1024px) 50vw, 50vw"
                            className="object-cover"
                          />
                        </div>
                      );
                    }
                    return (
                      <ScrollReveal key={img.id} direction="up" distance={30} className="w-full relative aspect-[3/4] bg-[#F5F5F5]">
                        <Image
                          src={img.url}
                          alt={img.altText || `${product.name} detail ${idx + 1}`}
                          fill
                          sizes="50vw"
                          loading="lazy"
                          className="object-cover"
                        />
                      </ScrollReveal>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="w-full aspect-[3/4] bg-[#F5F5F5] flex items-center justify-center">
                <span className="uppercase tracking-widest text-[10px] text-noir/40">No Image Available</span>
              </div>
            )}
          </div>

          <div className="w-full md:w-1/2 md:sticky md:top-32 h-fit order-2 lg:p-12">
            <ScrollReveal direction="up" distance={30}>
              <nav className="text-[10px] tracking-widest uppercase text-noir/50 mb-4 flex items-center gap-1.5">
                <Link href="/" className="hover:text-noir transition-colors">Home</Link>
                <span>/</span>
                <span className="text-noir truncate">{product.name}</span>
              </nav>

              <h1 className="text-xl md:text-3xl font-display uppercase tracking-widest mb-6 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 text-xs tracking-widest mb-4 text-noir/80">
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="line-through">${product.comparePrice.toFixed(2)}</span>
                )}
                <span>${product.price.toFixed(2)}</span>
              </div>

              {(product.colors?.length || product.sizes?.length) && (
                <div className="text-xs tracking-widest mb-8">
                  {availableStock > 0 ? <span className="text-green-600">{availableStock} in stock</span> : <span className="text-red-500">Out of stock</span>}
                </div>
              )}

              <div className="prose prose-sm prose-p:text-noir/60 max-w-sm mb-12 leading-relaxed text-[11px] md:text-xs">
                <p>{product.description}</p>
              </div>

              <div className="space-y-8 mb-12 max-w-sm">
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-4 text-[10px] uppercase tracking-[0.2em] font-medium">
                      <span>Color</span>
                      <span className="text-noir/60">{selectedColor}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={cn("w-8 h-8 rounded-full border flex items-center justify-center transition-all", selectedColor === color ? "border-noir scale-110 p-[2px]" : "border-noir/10 hover:border-noir/30")}
                        >
                          <span className="w-full h-full rounded-full border border-noir/5 block" style={{ backgroundColor: color.toLowerCase() }} />
                          <span className="sr-only">{color}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-4 text-[10px] uppercase tracking-[0.2em] font-medium">
                      <span>Size</span>
                      <button className="text-noir/60 hover:text-noir transition-colors border-b border-transparent hover:border-noir">Size Guide</button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={cn("h-10 border text-[10px] uppercase tracking-widest transition-colors", selectedSize === size ? "border-noir bg-noir text-cream" : "border-noir/20 hover:border-noir text-noir/80")}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 max-w-sm mb-16">
                <Button variant="luxury" className="flex-1 h-12 text-[10px] tracking-[0.2em] uppercase" onClick={handleAddToCart} disabled={availableStock < 1}>
                  {availableStock < 1 ? "Sold Out" : "Add to Bag"}
                </Button>
                <Button variant="outline" className="flex-1 h-12 text-[10px] tracking-[0.2em] uppercase border-noir text-noir hover:bg-noir hover:text-cream" onClick={handleBuyNow} disabled={availableStock < 1}>
                  {availableStock < 1 ? "Sold Out" : "Buy Now"}
                </Button>
                <button
                  onClick={() => toggleItem(product)}
                  className="w-12 h-12 border border-noir flex items-center justify-center group hover:bg-noir hover:text-cream transition-colors flex-shrink-0"
                  aria-label="Wishlist"
                >
                  <Heart className={cn("w-4 h-4 transition-colors", wishlisted && "fill-current text-rose group-hover:text-rose")} strokeWidth={1.5} />
                </button>
              </div>

              <div className="divide-y border-t border-noir/10 border-b max-w-sm">
                <details className="group" open>
                  <summary className="flex justify-between items-center py-4 cursor-pointer list-none text-[10px] uppercase tracking-widest font-medium group-open:text-rose transition-colors">
                    Details & Care
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="16" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="16"><path d="M6 9l6 6 6-6"></path></svg>
                    </span>
                  </summary>
                  <div className="text-noir/60 text-[11px] pb-5 space-y-2 leading-relaxed">
                    {product.material && <p><span className="text-noir uppercase tracking-wider text-[9px] mr-2">Material:</span> {product.material}</p>}
                    {product.fit && <p><span className="text-noir uppercase tracking-wider text-[9px] mr-2">Fit:</span> {product.fit}</p>}
                    {product.care && <p><span className="text-noir uppercase tracking-wider text-[9px] mr-2">Care:</span> {product.care}</p>}
                    {product.longDesc && <p className="pt-2">{product.longDesc}</p>}
                  </div>
                </details>
                <details className="group">
                  <summary className="flex justify-between items-center py-4 cursor-pointer list-none text-[10px] uppercase tracking-widest font-medium group-open:text-rose transition-colors">
                    Shipping & Returns
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="16" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="16"><path d="M6 9l6 6 6-6"></path></svg>
                    </span>
                  </summary>
                  <div className="text-noir/60 text-[11px] pb-5 leading-relaxed">
                    <p>Complimentary express shipping on all orders over $500. Returns are accepted within 14 days of delivery for unworn items in original packaging with tags attached.</p>
                  </div>
                </details>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
