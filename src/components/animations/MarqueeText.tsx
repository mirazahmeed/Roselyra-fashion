"use client";

import { cn } from "@/lib/utils";

interface MarqueeTextProps {
  text: string;
  className?: string;
  speed?: number;
  separator?: string;
  reverse?: boolean;
  textClassName?: string;
}

export function MarqueeText({
  text,
  className,
  speed = 30,
  separator = "✦",
  reverse = false,
  textClassName,
}: MarqueeTextProps) {
  const content = Array(8)
    .fill(null)
    .map((_, i) => (
      <span key={i} className="flex items-center gap-8 shrink-0 px-4">
        <span className={cn("whitespace-nowrap", textClassName)}>{text}</span>
        <span className="text-rose opacity-60">{separator}</span>
      </span>
    ));

  return (
    <div
      className={cn(
        "overflow-hidden whitespace-nowrap select-none",
        className
      )}
    >
      <div
        className={cn(
          "inline-flex will-change-transform",
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        )}
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {content}
        {content}
      </div>
    </div>
  );
}
