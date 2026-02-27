import { db } from "@/lib/db";
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
  const category = db.getCategoryBySlug(params.slug);

  if (!category) return {};

  return {
    title: category.name,
    description: category.description || undefined,
  };
}

export default async function CategoryDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = db.getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  const products = db.getProducts({ category: params.slug, perPage: 50 }).items;

  return (
    <PageTransition>
      <div className="pt-40 pb-24 min-h-screen bg-cream text-noir">
        <div className="w-full px-2 md:px-4">
          <ScrollReveal direction="up" distance={30}>
            <div className="text-center mb-16">
              <h1 className="text-[10vw] leading-none font-display uppercase tracking-wider">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-sm text-noir/60 mt-6 max-w-xl mx-auto">
                  {category.description}
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
              No products available in this category yet.
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
