"use client";

import Link from "next/link";
import { Newsletter } from "@/components/ui/Newsletter";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { MarqueeText } from "@/components/animations/MarqueeText";
import { MagneticButton } from "@/components/animations/MagneticButton";

const FOOTER_LINKS = {
  Shop: [
    { href: "/collections", label: "All Collections" },
    { href: "/categories/clothing", label: "Clothing" },
    { href: "/categories/accessories", label: "Accessories" },
    { href: "/campaigns", label: "Campaigns" },
  ],
  ClientCare: [
    { href: "/contact", label: "Contact Us" },
    { href: "/shipping-returns", label: "Shipping & Returns" },
    { href: "/faq", label: "FAQ" },
    { href: "/track-order", label: "Track Order" },
  ],
  Legal: [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/accessibility", label: "Accessibility" },
  ],
};

function AnimatedColumn({
  title,
  links,
  index,
}: {
  title: string;
  links: { href: string; label: string }[];
  index: number;
}) {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.7,
        delay: index * 0.12,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <h4 className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold mb-6">
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[10px] md:text-xs tracking-widest uppercase hover:text-rose transition-colors line-draw"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function Footer() {
  const { ref: brandRef, inView: brandInView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  const { ref: bottomRef, inView: bottomInView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  return (
    <footer className="bg-cream text-noir pt-32 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        {/* Massive Brand Text - Animated */}
        <motion.div
          ref={brandRef}
          className="mb-16 text-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={brandInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MagneticButton strength={0.08}>
            <Link href="/" className="block">
              <motion.span
                className="text-[12vw] leading-none font-display tracking-[0.1em] uppercase hover:opacity-80 transition-opacity block"
                initial={{ y: "100%", opacity: 0 }}
                animate={
                  brandInView
                    ? { y: 0, opacity: 1 }
                    : { y: "100%", opacity: 0 }
                }
                transition={{
                  duration: 1.2,
                  ease: [0.87, 0, 0.13, 1],
                  delay: 0.1,
                }}
              >
                Roselyra
              </motion.span>
            </Link>
          </MagneticButton>
        </motion.div>

        {/* Minimal Links Columns - Staggered */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 max-w-5xl mx-auto border-t border-noir/10 pt-16">
          <AnimatedColumn
            title="Shop"
            links={FOOTER_LINKS.Shop}
            index={0}
          />
          <AnimatedColumn
            title="Client Care"
            links={FOOTER_LINKS.ClientCare}
            index={1}
          />
          <AnimatedColumn
            title="Legal"
            links={FOOTER_LINKS.Legal}
            index={2}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.7,
              delay: 0.36,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <h4 className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold mb-6">
              Stay Connected
            </h4>
            <Newsletter />
            <div className="flex gap-4 mt-8">
              <MagneticButton strength={0.3}>
                <a
                  href="#"
                  className="text-[10px] md:text-xs tracking-widest uppercase hover:text-rose transition-colors line-draw"
                >
                  IG
                </a>
              </MagneticButton>
              <MagneticButton strength={0.3}>
                <a
                  href="#"
                  className="text-[10px] md:text-xs tracking-widest uppercase hover:text-rose transition-colors line-draw"
                >
                  PIN
                </a>
              </MagneticButton>
              <MagneticButton strength={0.3}>
                <a
                  href="#"
                  className="text-[10px] md:text-xs tracking-widest uppercase hover:text-rose transition-colors line-draw"
                >
                  TT
                </a>
              </MagneticButton>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar - Animated */}
        <motion.div
          ref={bottomRef}
          className="mt-20 text-center text-[9px] text-noir/40 uppercase tracking-[0.3em]"
          initial={{ opacity: 0 }}
          animate={bottomInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <p>&copy; {new Date().getFullYear()} ROSELYRA.</p>
        </motion.div>
      </div>
    </footer>
  );
}
