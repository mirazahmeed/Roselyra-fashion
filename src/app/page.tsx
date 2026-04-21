import { PageTransition } from "@/components/animations/PageTransition";
import Link from "next/link";
import Image from "next/image";
import { mongo as db } from "@/lib/db";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await db.getSettings();
  const productsResult = await db.getProducts({ featured: true, perPage: 20 });
  const products = productsResult.items;
  const featuredProducts = products.filter(p => p.isFeatured && p.isActive && !p.isArchived);
  
  const hero1Product = products.find(p => p.id === 'prod_001') || null;
  const hero2Product = products.find(p => p.id === 'prod_002') || null;
  const hero1Image = hero1Product?.images?.[0]?.url || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800";
  const hero2Image = hero2Product?.images?.[0]?.url || "https://images.unsplash.com/photo-1542295669297-4d352b042bca?q=80&w=2787&auto=format&fit=crop";
  return (
    <PageTransition>
      <main className="bg-cream w-full overflow-hidden">
        <div className="absolute top-[35vh] md:top-[60vh] left-0 w-full z-20 pointer-events-none flex justify-center mix-blend-difference text-cream">
          <h1 className="text-[14vw] font-display tracking-[0.15em] uppercase leading-none text-center w-full shadow-text">
            Roselyra
          </h1>
        </div>

        <section className="relative h-[80vh] md:h-[120vh]">
          <Image
            src={hero1Image}
            alt="Hero"
            fill
            className="object-cover"
            priority
          />
        </section>

        <section className="py-24 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[5vw] md:text-3xl font-display uppercase tracking-widest mb-12 text-center">
              Featured
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {featuredProducts.slice(0, 8).map((product, idx) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group">
                  <div className="aspect-[3/4] relative overflow-hidden bg-noir/5">
                    {product.images[0] && (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-display uppercase tracking-wider group-hover:text-rose transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-noir/60 mt-1">
                      ${product.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  );
}