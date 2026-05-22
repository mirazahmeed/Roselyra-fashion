"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

interface ImageRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: "left" | "right" | "up" | "down";
  duration?: number;
  delay?: number;
  overlayColor?: string;
}

export function ImageReveal({
  children,
  className,
  direction = "left",
  duration = 1.2,
  delay = 0,
  overlayColor = "#0A0A0A",
}: ImageRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const overlay = overlayRef.current;
    const inner = innerRef.current;
    if (!container || !overlay || !inner) return;

    // Set initial overlay position
    const dirMap: Record<string, Record<string, string>> = {
      left: { transformOrigin: "left center", scaleX: "1", scaleY: "1" },
      right: { transformOrigin: "right center", scaleX: "1", scaleY: "1" },
      up: { transformOrigin: "center top", scaleX: "1", scaleY: "1" },
      down: { transformOrigin: "center bottom", scaleX: "1", scaleY: "1" },
    };

    const isHorizontal = direction === "left" || direction === "right";

    gsap.set(overlay, {
      transformOrigin: dirMap[direction].transformOrigin,
      scaleX: isHorizontal ? 1 : 1,
      scaleY: isHorizontal ? 1 : 1,
    });

    gsap.set(inner, { scale: 1.3 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    tl.to(overlay, {
      ...(isHorizontal ? { scaleX: 0 } : { scaleY: 0 }),
      duration,
      delay,
      ease: "power4.inOut",
    }).to(
      inner,
      {
        scale: 1,
        duration: duration * 0.8,
        ease: "power3.out",
      },
      `-=${duration * 0.4}`
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [direction, duration, delay]);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      <div ref={innerRef} className="w-full h-full">
        {children}
      </div>
      <div
        ref={overlayRef}
        className="absolute inset-0 z-10"
        style={{ backgroundColor: overlayColor }}
      />
    </div>
  );
}
