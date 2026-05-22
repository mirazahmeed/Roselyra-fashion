"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  splitBy?: "chars" | "words";
}

export function TextReveal({
  children,
  className,
  delay = 0,
  duration = 0.8,
  stagger = 0.03,
  tag: Tag = "h2",
  splitBy = "chars",
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const el = containerRef.current;
    if (!el) return;

    const spans = el.querySelectorAll(".split-item");

    gsap.set(spans, { opacity: 0, y: 40, rotateX: -90 });

    gsap.to(spans, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration,
      delay,
      stagger,
      ease: "power4.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [delay, duration, stagger]);

  const items =
    splitBy === "chars"
      ? children.split("").map((char, i) => (
          <span
            key={i}
            className="split-item inline-block will-change-[opacity,transform]"
            style={{ perspective: "400px" }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))
      : children.split(" ").map((word, i) => (
          <span
            key={i}
            className="split-item inline-block will-change-[opacity,transform] mr-[0.3em]"
            style={{ perspective: "400px" }}
          >
            {word}
          </span>
        ));

  return (
    <Tag
      ref={containerRef as React.RefObject<any>}
      className={cn("overflow-hidden", className)}
      style={{ perspective: "400px" }}
    >
      {items}
    </Tag>
  );
}
