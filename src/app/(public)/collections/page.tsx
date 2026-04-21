import { mongo } from "@/lib/db";
import Link from "next/link";
import { ProductCard } from "@/components/ui/ProductCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export default async function CollectionsPage() {
  const collections = await mongo.getCollections({ featured: false, includeInactive: false });
  const collectionsWithProducts = await Promise.all(
    collections.map(async (collection) => ({
      collection,
      products: (await mongo.getProducts({ collection: collection.slug, perPage: 12 })).items,
    }))
  );

  return (
    <PageTransition>
      <div className="pt-40 pb-24 min-h-screen bg-cream text-noir">
        <div className="w-full px-2 md:px-4">
          <ScrollReveal direction="up" distance={30}>
            <h1 className="text-[12vw] leading-none font-display uppercase tracking-wider mb-24 text-center">
              Collections
            </h1>
          </ScrollReveal>

<div className="space-y-40">
            {collectionsWithProducts.map(({ collection, products }, idx) => {
              return (
                <section key={collection.id}>
                  <div className="flex flex-col md:flex-row md:flex-end justify-between mb-8 pb-4">
                    <ScrollReveal direction="right" delay={0.1}>
                      <h2 className="text-2xl md:text-3xl font-display uppercase tracking-widest hover:text-rose transition-colors">
                        <Link href={`/collections/${collection.slug}`}>
                          {collection.name}
                        </Link>
                      </h2>
                    </ScrollReveal>
                    <ScrollReveal direction="left" delay={0.2} className="mt-4 md:mt-0 relative top-2">
                      <Link
                        href={`/collections/${collection.slug}`}
                        className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium hover:opacity-60 transition-opacity block"
                      >
                        Explore All ({products.length}+)
                      </Link>
                    </ScrollReveal>
                  </div>

                  {products.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-16 md:gap-x-4">
                      {products.map((product, pIdx) => (
                        <ScrollReveal
                          key={product.id}
                          direction="up"
                          delay={0.1 * (pIdx % 4)}
                        >
                          <ProductCard product={product} priority={idx === 0 && pIdx < 4} />
                        </ScrollReveal>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center text-noir/40 uppercase tracking-widest text-xs">
                      No products available in this collection yet.
                    </div>
                  )}
                </section>
              );
            })}

            {collections.length === 0 && (
              <div className="py-32 text-center text-noir/40 uppercase tracking-widest text-xs">
                No collections found.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
