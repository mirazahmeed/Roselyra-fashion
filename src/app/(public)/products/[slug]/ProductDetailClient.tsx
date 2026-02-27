"use client";

import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Product } from "@/types";
import Image from "next/image";
import { useState } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addItem, openCart } = useCartStore();
  const { toggleItem, isWishlisted } = useWishlistStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes?.[0] || null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors?.[0] || null
  );

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (product.colors?.length && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    if (product.stock < 1) {
      toast.error("Product is sold out");
      return;
    }

    addItem(product, quantity, selectedSize, selectedColor);
    toast.success("Added to bag");
    openCart();
  };

  const images = [...(product.images || [])].sort((a, b) => a.order - b.order);
  const wishlisted = isWishlisted(product.id);

  return (
    <PageTransition>
      <div className="pt-24 pb-20 md:pt-32 bg-cream text-noir min-h-screen">
        <div className="w-full px-2 md:px-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 relative">
            
            {/* Left: Vertical Image Storytelling Scroll */}
            <div className="w-full lg:w-1/2 flex flex-col gap-2 order-1">
              {images.length > 0 ? (
                images.map((img, idx) => (
                  <ScrollReveal key={img.id} direction="up" distance={50} className="w-full relative aspect-[3/4] bg-[#F5F5F5]">
                    <Image
                      src={img.url}
                      alt={img.altText || `${product.name} detail ${idx + 1}`}
                      fill
                      priority={idx === 0}
                      className="object-cover"
                    />
                  </ScrollReveal>
                ))
              ) : (
                <div className="w-full aspect-[3/4] bg-[#F5F5F5] flex items-center justify-center">
                  <span className="uppercase tracking-widest text-[10px] text-noir/40">No Image Available</span>
                </div>
              )}
            </div>

            {/* Right: Sticky Details Area (Desktop) */}
            <div className="w-full lg:w-1/2 lg:sticky lg:top-32 h-fit order-2 lg:p-12">
              <ScrollReveal direction="up" distance={30}>
                
                {/* Title */}
                <h1 className="text-xl md:text-3xl font-display uppercase tracking-widest mb-6 leading-tight">
                  {product.name}
                </h1>
                
                {/* Price */}
                <div className="flex items-center gap-4 text-xs tracking-widest mb-10 text-noir/80">
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="line-through">${product.comparePrice.toFixed(2)}</span>
                  )}
                  <span>${product.price.toFixed(2)}</span>
                </div>

                {/* Description */}
                <div className="prose prose-sm prose-p:text-noir/60 max-w-sm mb-12 leading-relaxed text-[11px] md:text-xs">
                  <p>{product.description}</p>
                </div>

                {/* Selectors */}
                <div className="space-y-8 mb-12 max-w-sm">
                  {/* Colors */}
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
                            className={cn(
                              "w-8 h-8 rounded-full border flex items-center justify-center transition-all",
                              selectedColor === color
                                ? "border-noir scale-110 p-[2px]"
                                : "border-noir/10 hover:border-noir/30"
                            )}
                          >
                            <span
                              className="w-full h-full rounded-full border border-noir/5 block"
                              style={{ backgroundColor: color.toLowerCase() }}
                            />
                            <span className="sr-only">{color}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-4 text-[10px] uppercase tracking-[0.2em] font-medium">
                        <span>Size</span>
                        <button className="text-noir/60 hover:text-noir transition-colors border-b border-transparent hover:border-noir">
                          Size Guide
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={cn(
                              "h-10 border text-[10px] uppercase tracking-widest transition-colors",
                              selectedSize === size
                                ? "border-noir bg-noir text-cream"
                                : "border-noir/20 hover:border-noir text-noir/80"
                            )}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 max-w-sm mb-16">
                  <Button
                    variant="luxury"
                    className="flex-1 h-12 text-[10px] tracking-[0.2em] uppercase"
                    onClick={handleAddToCart}
                    disabled={product.stock < 1}
                  >
                    {product.stock < 1 ? "Sold Out" : "Add to Bag"}
                  </Button>
                  
                  <button
                    onClick={() => toggleItem(product)}
                    className="w-12 h-12 border border-noir flex items-center justify-center group hover:bg-noir hover:text-cream transition-colors flex-shrink-0"
                    aria-label="Wishlist"
                  >
                    <Heart
                      className={cn("w-4 h-4 transition-colors", wishlisted && "fill-current text-rose group-hover:text-rose")}
                      strokeWidth={1.5}
                    />
                  </button>
                </div>

                {/* Accordion Details */}
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
    </PageTransition>
  );
}
