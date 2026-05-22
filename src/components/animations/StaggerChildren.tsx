"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

interface StaggerChildrenProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  duration?: number;
  threshold?: number;
}

const containerVariants = (staggerDelay: number) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  },
});

const itemVariants = (duration: number) => ({
  hidden: {
    opacity: 0,
    y: 30,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
});

export function StaggerChildren({
  children,
  className,
  staggerDelay = 0.08,
  duration = 0.7,
  threshold = 0.2,
}: StaggerChildrenProps) {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      variants={containerVariants(staggerDelay)}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  duration = 0.7,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}) {
  return (
    <motion.div variants={itemVariants(duration)} className={cn(className)}>
      {children}
    </motion.div>
  );
}
