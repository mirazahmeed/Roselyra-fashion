import Link from "next/link";
import { Newsletter } from "@/components/ui/Newsletter";

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

export function Footer() {
  return (
    <footer className="bg-cream text-noir pt-32 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        {/* Massive Brand Text */}
        <div className="mb-16 text-center">
          <Link href="/" className="block text-[12vw] leading-none font-display tracking-[0.1em] uppercase hover:opacity-80 transition-opacity">
            Roselyra
          </Link>
        </div>

        {/* Minimal Links Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 max-w-5xl mx-auto border-t border-noir/10 pt-16">
          <div>
            <h4 className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold mb-6">Shop</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.Shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[10px] md:text-xs tracking-widest uppercase hover:text-rose transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold mb-6">Client Care</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.ClientCare.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[10px] md:text-xs tracking-widest uppercase hover:text-rose transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold mb-6">Legal</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.Legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[10px] md:text-xs tracking-widest uppercase hover:text-rose transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold mb-6">Stay Connected</h4>
            <Newsletter />
            <div className="flex gap-4 mt-8">
              <a href="#" className="text-[10px] md:text-xs tracking-widest uppercase hover:text-rose transition-colors">IG</a>
              <a href="#" className="text-[10px] md:text-xs tracking-widest uppercase hover:text-rose transition-colors">PIN</a>
              <a href="#" className="text-[10px] md:text-xs tracking-widest uppercase hover:text-rose transition-colors">TT</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 text-center text-[9px] text-noir/40 uppercase tracking-[0.3em]">
          <p>&copy; {new Date().getFullYear()} ROSELYRA.</p>
        </div>
      </div>
    </footer>
  );
}
