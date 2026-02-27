import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const primaryImage =
    product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const secondaryImage =
    product.images?.find((img) => !img.isPrimary) || product.images?.[1] || primaryImage;

  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F5F5] mb-4">
        <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
          {primaryImage ? (
            <>
              {/* Default primary image */}
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText || product.name}
                fill
                priority={priority}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                className="object-cover transition-opacity duration-500 ease-in-out z-10 opacity-100 group-hover:opacity-0"
              />
              {/* Secondary image for hover effect */}
              {secondaryImage && (
                <Image
                  src={secondaryImage.url}
                  alt={secondaryImage.altText || product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                  className="object-cover absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
                />
              )}
            </>
          ) : (
             <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-noir/40">
                No Image
             </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center text-center">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-[10px] md:text-xs uppercase tracking-widest text-noir mb-1 hover:text-rose transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="text-[10px] md:text-[11px] text-noir/60">
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="line-through mr-2">${product.comparePrice.toFixed(2)}</span>
          )}
          <span>${product.price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
