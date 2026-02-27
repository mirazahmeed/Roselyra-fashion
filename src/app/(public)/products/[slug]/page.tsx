import { db } from "@/lib/db";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = db.getProductBySlug(params.slug);

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

export default function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = db.getProductBySlug(params.slug);

  if (!product || !product.isActive) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
