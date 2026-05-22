"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Truck, RotateCcw, Loader2, Check, Copy } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

const POPUP_STORAGE_KEY = "roselyra-welcome-popup-seen";
const COUPON_STORAGE_KEY = "roselyra-first-order-coupon";
const POPUP_DELAY_MS = 4000; // 4 seconds delay before showing

interface WelcomeOfferPopupProps {
  /** Discount percentage for first order */
  discountPercent?: number;
}

export function WelcomeOfferPopup({
  discountPercent = 10,
}: WelcomeOfferPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [agreedToPolicy, setAgreedToPolicy] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Don't show if user already seen or has a coupon
    const alreadySeen = localStorage.getItem(POPUP_STORAGE_KEY);
    const existingCoupon = localStorage.getItem(COUPON_STORAGE_KEY);

    if (alreadySeen || existingCoupon) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
      // Prevent background scroll
      document.body.style.overflow = "hidden";
    }, POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    document.body.style.overflow = "";
    localStorage.setItem(POPUP_STORAGE_KEY, "true");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !agreedToPolicy) return;

    setIsLoading(true);
    try {
      // Subscribe to newsletter
      const newsletterRes = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!newsletterRes.ok) {
        const json = await newsletterRes.json();
        throw new Error(json.error || "Failed to subscribe");
      }

      // Generate coupon for first order
      const couponRes = await fetch("/api/coupons/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const couponJson = await couponRes.json();

      if (couponJson.success && couponJson.data?.code) {
        setCouponCode(couponJson.data.code);
        localStorage.setItem(COUPON_STORAGE_KEY, couponJson.data.code);
        localStorage.setItem(POPUP_STORAGE_KEY, "true");
        setIsSuccess(true);
      } else {
        // Even if coupon fails, newsletter was successful
        toast.success("Thank you for subscribing!");
        handleClose();
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCoupon = async () => {
    if (!couponCode) return;
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      toast.success("Coupon code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDecline = () => {
    handleClose();
  };

  // Press Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isVisible) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, handleClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-noir/60 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Popup Container */}
          <motion.div
            className="relative w-[92vw] max-w-[680px] bg-cream overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            id="welcome-offer-popup"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-cream/90 backdrop-blur-sm rounded-full hover:bg-cream transition-colors group"
              aria-label="Close popup"
              id="welcome-offer-close"
            >
              <X
                className="w-4 h-4 text-noir group-hover:rotate-90 transition-transform duration-300"
                strokeWidth={1.5}
              />
            </button>

            {/* Background Image Section */}
            <div className="relative h-[180px] sm:h-[220px] overflow-hidden">
              <Image
                src="/welcome-popup-bg.png"
                alt="Roselyra Welcome"
                fill
                className="object-cover"
                priority
                sizes="680px"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-noir/20 via-transparent to-cream" />

              {/* Hero text over image */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
                <motion.p
                  className="text-cream/90 text-[10px] sm:text-xs uppercase tracking-[0.25em] font-medium mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Sign up for email and
                </motion.p>
                <motion.h2
                  className="text-cream font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-wider"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  style={{ textShadow: "0 2px 30px rgba(0,0,0,0.3)" }}
                >
                  Enjoy {discountPercent}% Off
                </motion.h2>
                <motion.p
                  className="text-cream font-display text-lg sm:text-xl md:text-2xl uppercase tracking-[0.15em] mt-1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  style={{ textShadow: "0 2px 20px rgba(0,0,0,0.2)" }}
                >
                  Your First Order!
                </motion.p>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-6 sm:px-10 pb-6 sm:pb-8 pt-4">
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Subtitle */}
                    <motion.p
                      className="text-center text-muted text-[11px] sm:text-xs tracking-wide mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      Stay informed about new products and exclusive sales.
                    </motion.p>

                    {/* Email Form */}
                    <motion.form
                      onSubmit={handleSubmit}
                      className="space-y-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          id="welcome-offer-email"
                          className="w-full px-4 py-3.5 bg-cream-dark/60 border border-noir/15 text-noir text-sm tracking-wide placeholder:text-muted-light/70 focus:outline-none focus:border-noir/40 transition-colors"
                        />
                      </div>

                      {/* Agreement checkbox */}
                      <label className="flex items-start gap-2.5 cursor-pointer group">
                        <div className="relative mt-0.5">
                          <input
                            type="checkbox"
                            checked={agreedToPolicy}
                            onChange={(e) => setAgreedToPolicy(e.target.checked)}
                            className="sr-only"
                            id="welcome-offer-agree"
                          />
                          <div
                            className={`w-4 h-4 border flex items-center justify-center transition-all duration-200 ${
                              agreedToPolicy
                                ? "bg-noir border-noir"
                                : "border-noir/30 group-hover:border-noir/50"
                            }`}
                          >
                            {agreedToPolicy && (
                              <Check className="w-2.5 h-2.5 text-cream" strokeWidth={3} />
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-muted tracking-wide leading-relaxed">
                          I agree to receive email and the terms of{" "}
                          <a
                            href="/privacy-policy"
                            className="underline hover:text-noir transition-colors"
                          >
                            Privacy Policy
                          </a>
                          .
                        </span>
                      </label>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading || !agreedToPolicy}
                        id="welcome-offer-submit"
                        className="w-full py-3.5 bg-noir text-cream text-xs sm:text-sm uppercase tracking-[0.2em] font-medium hover:bg-noir-soft disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Gift className="w-4 h-4" strokeWidth={1.5} />
                            Get My {discountPercent}% Off
                          </>
                        )}
                      </button>
                    </motion.form>

                    {/* Decline link */}
                    <motion.button
                      onClick={handleDecline}
                      className="w-full text-center mt-4 text-[10px] sm:text-[11px] text-muted underline underline-offset-2 hover:text-noir transition-colors tracking-wide"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      id="welcome-offer-decline"
                    >
                      No thanks, I&apos;d rather pay full price.
                    </motion.button>
                  </motion.div>
                ) : (
                  /* Success state with coupon code */
                  <motion.div
                    key="success"
                    className="text-center py-4"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Checkmark circle */}
                    <motion.div
                      className="w-14 h-14 rounded-full bg-noir flex items-center justify-center mx-auto mb-5"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                    >
                      <Check className="w-6 h-6 text-cream" strokeWidth={2} />
                    </motion.div>

                    <motion.h3
                      className="font-display text-xl sm:text-2xl text-noir uppercase tracking-wider mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Welcome to Roselyra
                    </motion.h3>

                    <motion.p
                      className="text-muted text-xs tracking-wide mb-5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      Your exclusive {discountPercent}% off coupon for your first
                      order:
                    </motion.p>

                    {/* Coupon code box */}
                    <motion.div
                      className="relative group"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                    >
                      <div className="flex items-center justify-center gap-3 bg-cream-dark border-2 border-dashed border-noir/25 px-6 py-4">
                        <span className="font-display text-2xl sm:text-3xl font-bold tracking-[0.15em] text-noir uppercase">
                          {couponCode}
                        </span>
                        <button
                          onClick={handleCopyCoupon}
                          className="p-2 hover:bg-noir/5 rounded-sm transition-colors"
                          aria-label="Copy coupon code"
                          id="welcome-offer-copy"
                        >
                          {copied ? (
                            <Check className="w-5 h-5 text-green-600" strokeWidth={2} />
                          ) : (
                            <Copy className="w-5 h-5 text-muted" strokeWidth={1.5} />
                          )}
                        </button>
                      </div>
                    </motion.div>

                    <motion.p
                      className="text-[10px] text-muted-light mt-3 tracking-wide"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      Use this code at checkout. Valid for your first order only.
                    </motion.p>

                    {/* CTA to start shopping */}
                    <motion.button
                      onClick={handleClose}
                      className="mt-5 px-8 py-3 bg-noir text-cream text-xs uppercase tracking-[0.2em] font-medium hover:bg-noir-soft transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      id="welcome-offer-shop"
                    >
                      Start Shopping
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Trust badges */}
              <motion.div
                className="flex items-center justify-center gap-6 sm:gap-10 mt-6 pt-5 border-t border-noir/8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <Truck
                    className="w-4 h-4 text-muted"
                    strokeWidth={1.5}
                  />
                  <div className="text-left">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-noir">
                      Free Shipping
                    </p>
                    <p className="text-[8px] sm:text-[9px] text-muted-light tracking-wide">
                      Orders over ৳2,000
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw
                    className="w-4 h-4 text-muted"
                    strokeWidth={1.5}
                  />
                  <div className="text-left">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-noir">
                      Easy Return
                    </p>
                    <p className="text-[8px] sm:text-[9px] text-muted-light tracking-wide">
                      Within 14 Days
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
