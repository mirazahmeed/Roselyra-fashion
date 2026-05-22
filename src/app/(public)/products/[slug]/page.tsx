import { mongo } from "@/lib/db";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const revalidate = 60;

// Cache the product fetch so generateMetadata and the page share it
async function getProduct(slug: string) {
  return mongo.getProductBySlug(slug);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProduct(params.slug);

  if (!product) return {};

  const ogImage = product.images[0]?.url || "";

  return {
    title: product.name,
    description: product.description || undefined,
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);

  if (!product || !product.isActive) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
