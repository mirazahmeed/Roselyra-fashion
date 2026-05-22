import Link from "next/link";
import Image from "next/image";
import { mongo as db } from "@/lib/db";
import {
  AnimatedBrandText,
  AnimatedGridCell,
  AnimatedLabel,
  AnimatedProductCard,
  AnimatedSectionHeading,
  MarqueeBand,
  HeroWrapper,
  MagneticLink,
} from "@/components/animations/HomeAnimations";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function Home() {
  const [config, productsResult] = await Promise.all([
    db.getSettings() as Promise<any>,
    db.getProducts({ perPage: 100 }),
  ]);
  const products = productsResult.items;
  const featuredProducts = products.filter(p => p.isFeatured && p.isActive && !p.isArchived);
  
  const getImg = (key: string, fallback: string) => config[key] || fallback;
  
  const getSlotConfig = (
    num: number,
    defaultImg: string,
    defaultLink: string,
    defaultLabel: string
  ) => {
    const imgKey = `hero${num}`;
    const prodKey = `hero${num}Product`;
    const linkKey = `hero${num}Link`;
    const labelKey = `hero${num}Label`;

    const productId = config[prodKey];
    const product = productId ? products.find(p => p.id === productId && p.isActive && !p.isArchived) : null;

    const image = config[imgKey] || product?.images?.[0]?.url || defaultImg;
    const link = product ? `/products/${product.slug}` : (config[linkKey] || defaultLink);
    const label = config[labelKey] || product?.name || defaultLabel;

    return { image, link, label, product };
  };

  const hero1 = getSlotConfig(1, "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800", "", "Shop Now");
  const hero2 = getSlotConfig(2, "https://images.unsplash.com/photo-1542295669297-4d352b042bca?q=80&w=2787&auto=format&fit=crop", "", "Shop Now");
  const hero3 = getSlotConfig(3, "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=3149&auto=format&fit=crop", "/collections/bags", "Shop bags");
  const hero4 = getSlotConfig(4, "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", "/collections/new", "Course in luxury");
  const hero5 = getSlotConfig(5, "https://images.unsplash.com/photo-1600091166971-7f9faad6c1e2?q=80&w=3148&auto=format&fit=crop", "/collections/rose", "Romance");
  const hero6 = getSlotConfig(6, "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=3270&auto=format&fit=crop", "/collections/editorial", "Cruise In Focus");
  const hero7 = getSlotConfig(7, "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", "/collections/dark", "Summer Of Romance");
  const hero8 = getSlotConfig(8, "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", "/collections/minimal", "Course Luxury");
  const hero9 = getSlotConfig(9, "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2724&auto=format&fit=crop", "/collections/crochet", "Crochet Artifacts");
  const hero10 = getSlotConfig(10, "https://images.unsplash.com/photo-1645292155425-1126d1a03d21?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", "/collections/artifacts", "Art Pieces");

  // Shared sizes attribute for 2-column grid images
  const heroSizes = "(max-width: 768px) 100vw, 50vw";
  
  return (
    <HeroWrapper>
      <main className="bg-cream w-full overflow-hidden">
        
        {/* Massive Brand Text - Animated entrance */}
        <AnimatedBrandText />

        {/* --- ROW 1 --- Full height hero */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <AnimatedGridCell index={0} className="relative h-[70vh] md:h-[90vh] w-full group">
            {hero1.product ? (
              <Link href={`/products/${hero1.product.slug}`} className="block w-full h-full">
                <Image
                  src={hero1.image}
                  alt={hero1.product.name}
                  fill
                  sizes={heroSizes}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute bottom-8 left-8 z-10">
                  <AnimatedLabel delay={0.5} className="text-cream text-xs uppercase tracking-widest font-bold mb-2">
                    {hero1.label}
                  </AnimatedLabel>
                  <h3 className="text-cream text-2xl font-display">{hero1.product.name}</h3>
                  <p className="text-cream/80">${hero1.product.price}</p>
                </div>
              </Link>
            ) : hero1.link ? (
              <Link href={hero1.link} className="block w-full h-full">
                <Image
                  src={hero1.image}
                  alt={hero1.label}
                  fill
                  sizes={heroSizes}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute bottom-8 left-8 z-10">
                  <AnimatedLabel delay={0.5} className="text-cream text-xs uppercase tracking-widest font-bold mb-2">
                    {hero1.label}
                  </AnimatedLabel>
                </div>
              </Link>
            ) : (
              <Image
                src={hero1.image}
                alt="Campaign Image 1"
                fill
                sizes={heroSizes}
                className="object-cover"
                priority
              />
            )}
          </AnimatedGridCell>
          <AnimatedGridCell index={1} className="relative h-[70vh] md:h-[90vh] w-full group">
            {hero2.product ? (
              <Link href={`/products/${hero2.product.slug}`} className="block w-full h-full">
                <Image
                  src={hero2.image}
                  alt={hero2.product.name}
                  fill
                  sizes={heroSizes}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute bottom-8 left-8 z-10">
                  <AnimatedLabel delay={0.7} className="text-cream text-xs uppercase tracking-widest font-bold mb-2">
                    {hero2.label}
                  </AnimatedLabel>
                  <h3 className="text-cream text-2xl font-display">{hero2.product.name}</h3>
                  <p className="text-cream/80">${hero2.product.price}</p>
                </div>
              </Link>
            ) : hero2.link ? (
              <Link href={hero2.link} className="block w-full h-full">
                <Image
                  src={hero2.image}
                  alt={hero2.label}
                  fill
                  sizes={heroSizes}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute bottom-8 left-8 z-10">
                  <AnimatedLabel delay={0.7} className="text-cream text-xs uppercase tracking-widest font-bold mb-2">
                    {hero2.label}
                  </AnimatedLabel>
                </div>
              </Link>
            ) : (
              <Image
                src={hero2.image}
                alt="Campaign Image 2"
                fill
                sizes={heroSizes}
                className="object-cover"
                priority
              />
            )}
          </AnimatedGridCell>
        </div>

        {/* --- Marquee Band --- */}
        <MarqueeBand />

        {/* --- ROW 2 --- */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <AnimatedGridCell index={0} className="relative h-[55vh] md:h-[65vh] w-full group bg-[#881416]">
            <Image
              src={hero3.image}
              alt={hero3.label}
              fill
              sizes={heroSizes}
              loading="lazy"
              className="object-cover mix-blend-overlay opacity-60"
            />
            {hero3.link && (
              <Link href={hero3.link} className="absolute inset-0 z-10">
                <AnimatedLabel delay={0.2} className="absolute bottom-1/4 right-8 text-[10px] md:text-xs text-cream uppercase tracking-widest font-bold">
                  {hero3.label}
                </AnimatedLabel>
              </Link>
            )}
          </AnimatedGridCell>
          <AnimatedGridCell index={1} className="relative h-[55vh] md:h-[65vh] w-full group">
             <Image
              src={hero4.image}
              alt={hero4.label}
              fill
              sizes={heroSizes}
              loading="lazy"
              className="object-cover"
            />
            {hero4.link && (
              <Link href={hero4.link} className="absolute inset-0 z-10">
                <AnimatedLabel delay={0.3} className="absolute top-1/2 left-8 -translate-y-1/2 text-[10px] md:text-xs text-cream uppercase tracking-widest font-bold">
                  {hero4.label}
                </AnimatedLabel>
              </Link>
            )}
          </AnimatedGridCell>
        </div>

        {/* --- ROW 3 --- */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <AnimatedGridCell index={0} className="relative h-[55vh] md:h-[65vh] w-full group">
            <Image
              src={hero5.image}
              alt={hero5.label}
              fill
              sizes={heroSizes}
              loading="lazy"
              className="object-cover"
            />
            {hero5.link && (
              <Link href={hero5.link} className="absolute inset-0 z-10">
                <AnimatedLabel delay={0.2} className="absolute top-1/2 right-8 -translate-y-1/2 text-[10px] md:text-xs text-noir uppercase tracking-widest font-bold">
                  {hero5.label}
                </AnimatedLabel>
              </Link>
            )}
          </AnimatedGridCell>
          <AnimatedGridCell index={1} className="relative h-[55vh] md:h-[65vh] w-full group">
             <Image
              src={hero6.image}
              alt={hero6.label}
              fill
              sizes={heroSizes}
              loading="lazy"
              className="object-cover"
            />
            {hero6.link && (
              <Link href={hero6.link} className="absolute inset-0 z-10">
                <AnimatedLabel delay={0.3} className="absolute top-1/2 left-8 -translate-y-1/2 text-[10px] md:text-xs text-noir uppercase tracking-widest font-bold">
                  {hero6.label}
                </AnimatedLabel>
              </Link>
            )}
          </AnimatedGridCell>
        </div>
        
        {/* --- ROW 4 --- */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <AnimatedGridCell index={0} className="relative h-[55vh] md:h-[65vh] w-full group bg-noir">
            <Image
              src={hero7.image}
              alt={hero7.label}
              fill
              sizes={heroSizes}
              loading="lazy"
              className="object-cover mix-blend-luminosity opacity-80"
            />
            {hero7.link && (
              <Link href={hero7.link} className="absolute inset-0 z-10">
                <AnimatedLabel delay={0.2} className="absolute top-1/2 right-8 -translate-y-1/2 text-[10px] md:text-xs text-cream uppercase tracking-widest font-bold">
                  {hero7.label}
                </AnimatedLabel>
              </Link>
            )}
          </AnimatedGridCell>
          <AnimatedGridCell index={1} className="relative h-[55vh] md:h-[65vh] w-full group">
             <Image
              src={hero8.image}
              alt={hero8.label}
              fill
              sizes={heroSizes}
              loading="lazy"
              className="object-cover"
            />
             {hero8.link && (
              <Link href={hero8.link} className="absolute inset-0 z-10">
                <AnimatedLabel delay={0.3} className="absolute top-1/2 left-8 -translate-y-1/2 text-[10px] md:text-xs text-cream uppercase tracking-widest font-bold">
                  {hero8.label}
                </AnimatedLabel>
              </Link>
            )}
          </AnimatedGridCell>
        </div>

        {/* --- ROW 5 --- */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <AnimatedGridCell index={0} className="relative h-[55vh] md:h-[65vh] w-full group">
            <Image
              src={hero9.image}
              alt={hero9.label}
              fill
              sizes={heroSizes}
              loading="lazy"
              className="object-cover"
            />
            {hero9.link && (
              <Link href={hero9.link} className="absolute inset-0 z-10">
                <AnimatedLabel delay={0.2} className="absolute top-1/2 right-8 -translate-y-1/2 text-[10px] md:text-xs text-noir uppercase tracking-widest font-bold text-right">
                  {hero9.label}
                </AnimatedLabel>
              </Link>
            )}
          </AnimatedGridCell>
          <AnimatedGridCell index={1} className="relative h-[55vh] md:h-[65vh] w-full group bg-[#111]">
             <Image
              src={hero10.image}
              alt={hero10.label}
              fill
              sizes={heroSizes}
              loading="lazy"
              className="object-cover opacity-80"
            />
            {hero10.link && (
              <Link href={hero10.link} className="absolute inset-0 z-10">
                <AnimatedLabel delay={0.3} className="absolute top-1/2 left-8 -translate-y-1/2 text-[10px] md:text-xs text-cream uppercase tracking-widest font-bold">
                  {hero10.label}
                </AnimatedLabel>
              </Link>
            )}
          </AnimatedGridCell>
        </div>

        {/* --- Featured Products --- Full editorial sizing */}
        <div className="py-24 px-4 md:px-12">
          <AnimatedSectionHeading className="text-center text-sm font-display uppercase tracking-[0.3em] mb-16">
            Featured Products
          </AnimatedSectionHeading>
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {featuredProducts.map((product, idx) => (
                <AnimatedProductCard key={product.id} index={idx}>
                  <Link href={`/products/${product.slug}`} className="group block">
                    <div className="relative w-full aspect-[3/4] overflow-hidden mb-4 bg-[#f5f5f5]">
                      <Image
                        src={product.images?.[0]?.url || "/placeholder.jpg"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        loading="lazy"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] uppercase tracking-widest text-noir font-medium hover:text-rose transition-colors block line-draw">
                        {product.name}
                      </span>
                      <span className="text-[10px] text-noir/60 mt-1 block">${product.price.toFixed(2)}</span>
                    </div>
                  </Link>
                </AnimatedProductCard>
              ))}
            </div>
          ) : (
            /* Fallback: 3 hardcoded editorial products */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {/* Product 1 */}
              <AnimatedProductCard index={0}>
                <Link href="/products/medium-rose-hobo-bag" className="group block">
                  <div className="relative w-full aspect-[3/4] overflow-hidden mb-4 bg-[#f5f5f5]">
                    <Image
                      src={getImg('hero11', "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=3149&auto=format&fit=crop")}
                      alt="Medium Rose Hobo Bag"
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      loading="lazy"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] uppercase tracking-widest text-noir font-medium hover:text-rose transition-colors block line-draw">
                      Medium Rose Hobo Bag
                    </span>
                  </div>
                </Link>
              </AnimatedProductCard>

              {/* Product 2 */}
              <AnimatedProductCard index={1}>
                <Link href="/products/long-sleeve-mini-dress" className="group block">
                  <div className="relative w-full aspect-[3/4] overflow-hidden mb-4 bg-[#f5f5f5]">
                    <Image
                      src={getImg('hero12', "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2787&auto=format&fit=crop")}
                      alt="Long Sleeve Mini Dress"
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      loading="lazy"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] uppercase tracking-widest text-noir font-medium hover:text-rose transition-colors block line-draw">
                      Long Sleeve Mini Dress
                    </span>
                  </div>
                </Link>
              </AnimatedProductCard>

              {/* Product 3 */}
              <AnimatedProductCard index={2}>
                <Link href="/products/red-rose-heels" className="group block">
                  <div className="relative w-full aspect-[3/4] overflow-hidden mb-4 bg-[#f5f5f5]">
                    <Image
                      src={getImg('hero13', "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2960&auto=format&fit=crop")}
                      alt="Red Rose Heels"
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      loading="lazy"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] uppercase tracking-widest text-noir font-medium hover:text-rose transition-colors block line-draw">
                      Red Rose Heels
                    </span>
                  </div>
                </Link>
              </AnimatedProductCard>
            </div>
          )}
        </div>

      </main>
    </HeroWrapper>
  );
}