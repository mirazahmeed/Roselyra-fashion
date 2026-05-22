"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export function CountUp({
  end,
  duration = 2,
  prefix = "",
  suffix = "",
  className,
  decimals = 0,
}: CountUpProps) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) return;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min(
        (timestamp - startTime.current) / (duration * 1000),
        1
      );

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * end);

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [inView, end, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
}
