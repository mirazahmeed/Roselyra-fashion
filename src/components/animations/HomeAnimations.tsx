"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
import { HeroReveal } from "@/components/animations/HeroReveal";
import { MarqueeText } from "@/components/animations/MarqueeText";
import { MagneticButton } from "@/components/animations/MagneticButton";

// Animated hero brand text
export function AnimatedBrandText() {
  return (
    <motion.div
      className="absolute top-[35vh] md:top-[60vh] left-0 w-full z-20 pointer-events-none flex justify-center mix-blend-difference text-cream"
      initial={{ opacity: 0, scale: 1.1, letterSpacing: "0.3em" }}
      animate={{ opacity: 1, scale: 1, letterSpacing: "0.15em" }}
      transition={{
        duration: 1.6,
        delay: 0.8,
        ease: [0.87, 0, 0.13, 1],
      }}
    >
      <h1 className="text-[14vw] font-display tracking-[0.15em] uppercase leading-none text-center w-full shadow-text">
        Roselyra
      </h1>
    </motion.div>
  );
}

// Animated grid cell wrapper (image + overlay label)
export function AnimatedGridCell({
  children,
  index = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  const { ref, inView } = useInView({
    threshold: 0.15,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      initial={{ opacity: 0, scale: 1.05 }}
      animate={
        inView
          ? { opacity: 1, scale: 1 }
          : { opacity: 0, scale: 1.05 }
      }
      transition={{
        duration: 1,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  );
}

// Animated label text on images
export function AnimatedLabel({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  return (
    <motion.span
      ref={ref}
      className={cn("block line-draw", className)}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{
        duration: 0.8,
        delay: delay + 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.span>
  );
}

// Product entrance animation
export function AnimatedProductCard({
  children,
  index = 0,
}: {
  children: React.ReactNode;
  index?: number;
}) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 40, filter: "blur(4px)" }
      }
      transition={{
        duration: 0.7,
        delay: (index % 3) * 0.12,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  );
}

// Section heading with gradient text animation
export function AnimatedSectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  return (
    <motion.h2
      ref={ref}
      className={cn(className)}
      initial={{ opacity: 0, y: 20, letterSpacing: "0.5em" }}
      animate={
        inView
          ? { opacity: 1, y: 0, letterSpacing: "0.3em" }
          : { opacity: 0, y: 20, letterSpacing: "0.5em" }
      }
      transition={{
        duration: 1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.h2>
  );
}

// Magnetic CTA wrapper for shop links
export function MagneticLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MagneticButton className={className} strength={0.2}>
      {children}
    </MagneticButton>
  );
}

// Marquee band between sections
export function MarqueeBand() {
  return (
    <div className="py-6 bg-noir text-cream overflow-hidden">
      <MarqueeText
        text="NEW COLLECTION"
        separator="✦"
        speed={25}
        textClassName="text-xs tracking-[0.3em] uppercase font-medium"
      />
    </div>
  );
}

// Hero reveal wrapper
export function HeroWrapper({ children }: { children: React.ReactNode }) {
  return <HeroReveal>{children}</HeroReveal>;
}
