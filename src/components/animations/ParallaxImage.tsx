"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ParallaxImage({
  src,
  alt,
  className,
  speed = 0.5,
}: {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (!containerRef.current || !imageRef.current) return;

    const yPercent = speed * 100;

    gsap.to(imageRef.current, {
      yPercent,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [speed]);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden w-full h-full", className)}>
      <div ref={imageRef} className="absolute top-[-20%] left-0 w-full h-[140%]">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover will-change-transform"
          priority={speed === 0.3}
        />
      </div>
    </div>
  );
}
