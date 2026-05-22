"use client";

import { motion } from "framer-motion";

export function HeroReveal({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* Curtain overlay */}
      <motion.div
        className="fixed inset-0 z-[100] bg-noir pointer-events-none"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 1, ease: [0.87, 0, 0.13, 1], delay: 0.3 }}
        style={{ transformOrigin: "top" }}
      />

      {/* Content with fade-in */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
