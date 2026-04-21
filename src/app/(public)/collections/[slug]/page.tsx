import { mongo } from "@/lib/db";
import { ProductCard } from "@/components/ui/ProductCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const collection = await mongo.getCollectionBySlug(params.slug);

  if (!collection) return {};

  return {
    title: collection.name,
    description: collection.description || undefined,
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const collection = await mongo.getCollectionBySlug(params.slug);

  if (!collection) {
    notFound();
  }

  const products = (await mongo.getProducts({ collection: params.slug, perPage: 50 })).items;

  return (
    <PageTransition>
      <div className="pt-40 pb-24 min-h-screen bg-cream text-noir">
        <div className="w-full px-2 md:px-4">
          <ScrollReveal direction="up" distance={30}>
            <div className="text-center mb-16">
              {collection.season && collection.year && (
                <p className="text-xs uppercase tracking-[0.3em] text-noir/50 mb-4">
                  {collection.season} {collection.year}
                </p>
              )}
              <h1 className="text-[10vw] leading-none font-display uppercase tracking-wider">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-sm text-noir/60 mt-6 max-w-xl mx-auto">
                  {collection.description}
                </p>
              )}
            </div>
          </ScrollReveal>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-16 md:gap-x-4">
              {products.map((product, idx) => (
                <ScrollReveal
                  key={product.id}
                  direction="up"
                  delay={0.05 * (idx % 8)}
                >
                  <ProductCard product={product} priority={idx < 8} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center text-noir/40 uppercase tracking-widest text-xs">
              No products available in this collection yet.
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
