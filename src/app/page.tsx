import { PageTransition } from "@/components/animations/PageTransition";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Product } from "@/types";

export default function Home() {
  const config = db.homeConfig || {};
  const products = db.products || [];
  const featuredProducts = products.filter(p => p.isFeatured && p.isActive && !p.isArchived);
  const getImg = (key: string, fallback: string) => config[key] || fallback;
  const getProduct = (key: string) => {
    const productId = config[key];
    if (!productId) return null;
    return products.find(p => p.id === productId) || null;
  };
  
  const hero1Product = getProduct('hero1Product');
  const hero2Product = getProduct('hero2Product');
  const hero1Image = hero1Product?.images?.[0]?.url || getImg('hero1', "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800");
  const hero2Image = hero2Product?.images?.[0]?.url || getImg('hero2', "https://images.unsplash.com/photo-1542295669297-4d352b042bca?q=80&w=2787&auto=format&fit=crop");
  return (
    <PageTransition>
      <main className="bg-cream w-full overflow-hidden">
        
        {/* Massive Brand Text - Absolutely positioned over the first two sections */}
        <div className="absolute top-[35vh] md:top-[60vh] left-0 w-full z-20 pointer-events-none flex justify-center mix-blend-difference text-cream">
          <h1 className="text-[14vw] font-display tracking-[0.15em] uppercase leading-none text-center w-full shadow-text">
            Roselyra
          </h1>
        </div>

        {/* --- ROW 1 --- Full height hero */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-[70vh] md:h-[90vh] w-full group">
            {hero1Product ? (
              <Link href={`/products/${hero1Product.slug}`} className="block w-full h-full">
                <Image
                  src={hero1Image}
                  alt={hero1Product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute bottom-8 left-8 z-10">
                  <p className="text-cream text-xs uppercase tracking-widest font-bold mb-2">Shop Now</p>
                  <h3 className="text-cream text-2xl font-display">{hero1Product.name}</h3>
                  <p className="text-cream/80">${hero1Product.price}</p>
                </div>
              </Link>
            ) : (
              <Image
                src={hero1Image}
                alt="Campaign Image 1"
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
          <div className="relative h-[70vh] md:h-[90vh] w-full group">
            {hero2Product ? (
              <Link href={`/products/${hero2Product.slug}`} className="block w-full h-full">
                <Image
                  src={hero2Image}
                  alt={hero2Product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute bottom-8 left-8 z-10">
                  <p className="text-cream text-xs uppercase tracking-widest font-bold mb-2">Shop Now</p>
                  <h3 className="text-cream text-2xl font-display">{hero2Product.name}</h3>
                  <p className="text-cream/80">${hero2Product.price}</p>
                </div>
              </Link>
            ) : (
              <Image
                src={hero2Image}
                alt="Campaign Image 2"
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
        </div>

        {/* --- ROW 2 --- */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-[55vh] md:h-[65vh] w-full group bg-[#881416]">
            <Image
              src={getImg('hero3', "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=3149&auto=format&fit=crop")}
              alt="Bags"
              fill
              className="object-cover mix-blend-overlay opacity-60"
            />
            <Link href="/collections/bags" className="absolute inset-0 z-10">
              <span className="absolute bottom-1/4 right-8 text-[10px] md:text-xs text-cream uppercase tracking-widest font-bold">
                Shop bags
              </span>
            </Link>
          </div>
          <div className="relative h-[55vh] md:h-[65vh] w-full group">
             <Image
              src={getImg('hero4', "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")}
              alt="Sparkle"
              fill
              className="object-cover"
            />
            <Link href="/collections/new" className="absolute inset-0 z-10">
              <span className="absolute top-1/2 left-8 -translate-y-1/2 text-[10px] md:text-xs text-cream uppercase tracking-widest font-bold">
                Course in luxury
              </span>
            </Link>
          </div>
        </div>

        {/* --- ROW 3 --- */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-[55vh] md:h-[65vh] w-full group">
            <Image
              src={getImg('hero5', "https://images.unsplash.com/photo-1600091166971-7f9faad6c1e2?q=80&w=3148&auto=format&fit=crop")}
              alt="Roses"
              fill
              className="object-cover"
            />
            <Link href="/collections/rose" className="absolute inset-0 z-10">
              <span className="absolute top-1/2 right-8 -translate-y-1/2 text-[10px] md:text-xs text-noir uppercase tracking-widest font-bold">
                Romance
              </span>
            </Link>
          </div>
          <div className="relative h-[55vh] md:h-[65vh] w-full group">
             <Image
              src={getImg('hero6', "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=3270&auto=format&fit=crop")}
              alt="Editorial"
              fill
              className="object-cover"
            />
            <Link href="/collections/editorial" className="absolute inset-0 z-10">
              <span className="absolute top-1/2 left-8 -translate-y-1/2 text-[10px] md:text-xs text-noir uppercase tracking-widest font-bold">
                Cruise In Focus
              </span>
            </Link>
          </div>
        </div>
        
        {/* --- ROW 4 --- */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-[55vh] md:h-[65vh] w-full group bg-noir">
            <Image
              src={getImg('hero7', "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")}
              alt="Black White Rose"
              fill
              className="object-cover mix-blend-luminosity opacity-80"
            />
            <Link href="/collections/dark" className="absolute inset-0 z-10">
              <span className="absolute top-1/2 right-8 -translate-y-1/2 text-[10px] md:text-xs text-cream uppercase tracking-widest font-bold">
                Summer Of Romance
              </span>
            </Link>
          </div>
          <div className="relative h-[55vh] md:h-[65vh] w-full group">
             <Image
              src={getImg('hero8', "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")}
              alt="Minimal"
              fill
              className="object-cover"
            />
             <Link href="/collections/minimal" className="absolute inset-0 z-10">
              <span className="absolute top-1/2 left-8 -translate-y-1/2 text-[10px] md:text-xs text-cream uppercase tracking-widest font-bold">
                Course Luxury
              </span>
            </Link>
          </div>
        </div>

        {/* --- ROW 5 --- */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-[55vh] md:h-[65vh] w-full group">
            <Image
              src={getImg('hero9', "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2724&auto=format&fit=crop")}
              alt="Crochet"
              fill
              className="object-cover"
            />
            <Link href="/collections/crochet" className="absolute inset-0 z-10">
              <span className="absolute top-1/2 right-8 -translate-y-1/2 text-[10px] md:text-xs text-noir uppercase tracking-widest font-bold text-right">
                Crochet Artifacts
              </span>
            </Link>
          </div>
          <div className="relative h-[55vh] md:h-[65vh] w-full group bg-[#111]">
             <Image
              src={getImg('hero10', "https://images.unsplash.com/photo-1645292155425-1126d1a03d21?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")}
              alt="White Rose"
              fill
              className="object-cover opacity-80"
            />
            <Link href="/collections/artifacts" className="absolute inset-0 z-10">
              <span className="absolute top-1/2 left-8 -translate-y-1/2 text-[10px] md:text-xs text-cream uppercase tracking-widest font-bold">
                Art Pieces
              </span>
            </Link>
          </div>
        </div>

        {/* --- Featured Products --- Full editorial sizing */}
        <div className="py-24 px-4 md:px-12">
          <h2 className="text-center text-sm font-display uppercase tracking-[0.3em] mb-16">Featured Products</h2>
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group block">
                  <div className="relative w-full aspect-[3/4] overflow-hidden mb-4 bg-[#f5f5f5]">
                    <Image
                      src={product.images?.[0]?.url || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] uppercase tracking-widest text-noir font-medium hover:text-rose transition-colors block">
                      {product.name}
                    </span>
                    <span className="text-[10px] text-noir/60 mt-1 block">${product.price.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Fallback: 3 hardcoded editorial products */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {/* Product 1 */}
              <Link href="/products/medium-rose-hobo-bag" className="group block">
                <div className="relative w-full aspect-[3/4] overflow-hidden mb-4 bg-[#f5f5f5]">
                  <Image
                    src={getImg('hero11', "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=3149&auto=format&fit=crop")}
                    alt="Medium Rose Hobo Bag"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="text-center">
                  <span className="text-[10px] uppercase tracking-widest text-noir font-medium hover:text-rose transition-colors block">
                    Medium Rose Hobo Bag
                  </span>
                </div>
              </Link>

              {/* Product 2 */}
              <Link href="/products/long-sleeve-mini-dress" className="group block">
                <div className="relative w-full aspect-[3/4] overflow-hidden mb-4 bg-[#f5f5f5]">
                  <Image
                    src={getImg('hero12', "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2787&auto=format&fit=crop")}
                    alt="Long Sleeve Mini Dress"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="text-center">
                  <span className="text-[10px] uppercase tracking-widest text-noir font-medium hover:text-rose transition-colors block">
                    Long Sleeve Mini Dress
                  </span>
                </div>
              </Link>

              {/* Product 3 */}
              <Link href="/products/red-rose-heels" className="group block">
                <div className="relative w-full aspect-[3/4] overflow-hidden mb-4 bg-[#f5f5f5]">
                  <Image
                    src={getImg('hero13', "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2960&auto=format&fit=crop")}
                    alt="Red Rose Heels"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="text-center">
                  <span className="text-[10px] uppercase tracking-widest text-noir font-medium hover:text-rose transition-colors block">
                    Red Rose Heels
                  </span>
                </div>
              </Link>
            </div>
          )}
        </div>

      </main>
    </PageTransition>
  );
}
