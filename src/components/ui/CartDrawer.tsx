"use client";

import { useCartStore } from "@/store/cartStore";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCartStore();

  // Prevent background scrolling when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-noir/20 z-[70] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[480px] bg-cream text-noir z-[80] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-noir/10 flex items-center justify-between">
              <h2 className="text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] flex items-center gap-3">
                Shopping Bag
                <span className="text-noir/40">({items.length})</span>
              </h2>
              <button 
                onClick={closeCart}
                className="hover:opacity-50 transition-opacity"
              >
                <X className="w-5 h-5" strokeWidth={1} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                  <ShoppingBag className="w-8 h-8 stroke-[1]" />
                  <p className="uppercase tracking-widest text-[10px]">Your bag is empty.</p>
                  <Link 
                    href="/collections" 
                    onClick={closeCart}
                    className="border border-noir px-8 py-3 text-[10px] uppercase tracking-widest hover:bg-noir hover:text-cream transition-colors mt-4"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-8">
                  {items.map((item) => {
                    const primaryImage = item.product.images?.find((img) => img.isPrimary) || item.product.images?.[0];
                    return (
                      <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-6 group">
                        {/* Product Image */}
                        <div className="w-24 aspect-[3/4] bg-[#F5F5F5] relative overflow-hidden">
                          {primaryImage ? (
                            <Image
                              src={primaryImage.url}
                              alt={primaryImage.altText || item.product.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center border border-dashed border-noir/20" />
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-4">
                              <Link 
                                href={`/products/${item.product.slug}`}
                                onClick={closeCart}
                                className="text-[10px] md:text-xs font-medium uppercase tracking-widest hover:text-rose transition-colors"
                              >
                                {item.product.name}
                              </Link>
                              <span className="text-[10px] md:text-[11px] font-medium tracking-widest">${item.product.price.toFixed(2)}</span>
                            </div>
                            
                            {(item.size || item.color) && (
                              <p className="text-[9px] uppercase tracking-widest text-noir/60">
                                {item.color && `Color: ${item.color}`}
                                {item.color && item.size && " | "}
                                {item.size && `Size: ${item.size}`}
                              </p>
                            )}
                          </div>

                          {/* Quantity & Remove controls */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border border-noir/20 bg-transparent px-2 py-1">
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size, item.color)}
                                className="p-1 hover:text-rose transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-[10px] tracking-widest font-medium">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size, item.color)}
                                className="p-1 hover:text-rose transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button 
                              onClick={() => removeItem(item.product.id, item.size, item.color)}
                              className="text-[9px] uppercase tracking-widest text-noir/60 hover:text-noir transition-colors border-b border-transparent hover:border-noir pb-0.5"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer / Checkout Button */}
            {items.length > 0 && (
              <div className="p-8 bg-cream border-t border-noir/10 space-y-6">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-medium">
                  <span>Subtotal</span>
                  <span className="text-sm">${subtotal().toFixed(2)}</span>
                </div>
                <p className="text-[9px] text-noir/40 text-center tracking-widest uppercase">
                  Shipping and taxes calculated at checkout.
                </p>
                <Link 
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full bg-noir text-cream border border-noir text-center py-4 text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-cream hover:text-noir transition-colors"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
