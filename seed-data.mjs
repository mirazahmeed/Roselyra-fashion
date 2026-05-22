import { MongoClient, ObjectId } from "mongodb";

const uri = "mongodb+srv://roselyra-fashion:t0xgYa8kbUHJl4c3@cluster0.7cdmalj.mongodb.net/?appName=Cluster0";
const dbName = "roselyra";

// Placeholder image — user will update later
const PH = "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80";

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const collectionsCol = db.collection("collections");
  const categoriesCol = db.collection("categories");
  const productsCol = db.collection("products");

  // ─── Check existing data ────────────────────────
  const existingCollections = await collectionsCol.countDocuments();
  const existingProducts = await productsCol.countDocuments();
  const existingCategories = await categoriesCol.countDocuments();
  console.log(`Existing: ${existingCollections} collections, ${existingCategories} categories, ${existingProducts} products`);

  // ─── COLLECTIONS ────────────────────────────────
  const collectionData = [
    {
      name: "Spring Bloom 2026",
      slug: "spring-bloom-2026",
      description: "Embrace the season with flowing silhouettes, pastel tones, and delicate florals. A collection inspired by garden romance and morning light.",
      season: "Spring",
      year: 2026,
      isFeatured: true,
    },
    {
      name: "Midnight Luxe",
      slug: "midnight-luxe",
      description: "Dark elegance meets modern glamour. Statement pieces crafted for evenings that demand attention — rich velvets, silky satins, and bold cuts.",
      season: "Fall/Winter",
      year: 2026,
      isFeatured: true,
    },
    {
      name: "Riviera Escape",
      slug: "riviera-escape",
      description: "Sun-drenched resort wear for the modern traveler. Linen blends, breezy cuts, and Mediterranean-inspired prints for effortless coastal style.",
      season: "Summer",
      year: 2026,
      isFeatured: true,
    },
    {
      name: "Minimal Noir",
      slug: "minimal-noir",
      description: "The architecture of simplicity. Monochromatic essentials with impeccable tailoring — where restraint becomes the ultimate luxury.",
      season: "All Season",
      year: 2026,
      isFeatured: true,
    },
    {
      name: "Rose Heritage",
      slug: "rose-heritage",
      description: "A tribute to timeless femininity. Classic cuts reimagined with modern proportions, in our signature palette of blush, cream, and burgundy.",
      season: "Pre-Fall",
      year: 2026,
      isFeatured: true,
    },
    {
      name: "Urban Edge",
      slug: "urban-edge",
      description: "Streetwear sophistication. Oversized silhouettes, utility details, and deconstructed designs for the city-minded fashion forward.",
      season: "Spring/Summer",
      year: 2026,
      isFeatured: false,
    },
  ];

  const insertedCollections = [];
  for (const col of collectionData) {
    const existing = await collectionsCol.findOne({ slug: col.slug });
    if (existing) {
      console.log(`  ⏭ Collection "${col.name}" already exists, skipping`);
      insertedCollections.push(existing);
      continue;
    }
    const count = await collectionsCol.countDocuments();
    const doc = {
      _id: new ObjectId(),
      id: `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: col.name,
      slug: col.slug,
      description: col.description,
      imageUrl: null,
      videoUrl: null,
      season: col.season,
      year: col.year,
      isFeatured: col.isFeatured,
      isActive: true,
      order: count + 1,
    };
    await collectionsCol.insertOne(doc);
    insertedCollections.push(doc);
    console.log(`  ✅ Collection: ${col.name}`);
    await new Promise(r => setTimeout(r, 10)); // small delay for unique IDs
  }

  // ─── CATEGORIES ─────────────────────────────────
  const categoryData = [
    { name: "Dresses", slug: "dresses", description: "Elegant dresses for every occasion" },
    { name: "Tops & Blouses", slug: "tops-blouses", description: "Refined tops and statement blouses" },
    { name: "Bottoms", slug: "bottoms", description: "Skirts, trousers, and shorts" },
    { name: "Outerwear", slug: "outerwear", description: "Jackets, coats, and layering pieces" },
    { name: "Accessories", slug: "accessories", description: "Bags, jewelry, scarves, and more" },
    { name: "Shoes", slug: "shoes", description: "Heels, flats, sandals, and boots" },
  ];

  const insertedCategories = [];
  for (const cat of categoryData) {
    const existing = await categoriesCol.findOne({ slug: cat.slug });
    if (existing) {
      console.log(`  ⏭ Category "${cat.name}" already exists, skipping`);
      insertedCategories.push(existing);
      continue;
    }
    const count = await categoriesCol.countDocuments();
    const doc = {
      _id: new ObjectId(),
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: null,
      parentId: null,
      order: count + 1,
      isActive: true,
    };
    await categoriesCol.insertOne(doc);
    insertedCategories.push(doc);
    console.log(`  ✅ Category: ${cat.name}`);
    await new Promise(r => setTimeout(r, 10));
  }

  // Helper to find collection/category by slug
  const findCol = (slug) => insertedCollections.find(c => c.slug === slug);
  const findCat = (slug) => insertedCategories.find(c => c.slug === slug);

  // ─── PRODUCTS ───────────────────────────────────
  const productData = [
    // Spring Bloom 2026
    {
      name: "Floral Wrap Midi Dress",
      description: "A romantic midi dress in flowing chiffon with an all-over garden floral print. Features a flattering wrap silhouette with adjustable tie waist.",
      longDesc: "Crafted from lightweight chiffon, this wrap dress drapes beautifully with every step. The delicate floral print captures the essence of an English garden in full bloom.",
      price: 285,
      comparePrice: 350,
      material: "100% Silk Chiffon",
      fit: "True to size, wrap adjustable",
      care: "Dry clean only",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Blush Pink", "Sage Green"],
      tags: ["dress", "floral", "midi", "spring", "romantic"],
      stock: 25,
      isFeatured: true,
      collectionSlug: "spring-bloom-2026",
      categorySlug: "dresses",
    },
    {
      name: "Petal Sleeve Linen Blouse",
      description: "Delicate petal sleeves add a feminine touch to this crisp linen blouse. Perfect for layering or wearing alone on warm spring days.",
      price: 145,
      material: "100% European Linen",
      fit: "Relaxed fit",
      care: "Machine wash cold, hang dry",
      sizes: ["XS", "S", "M", "L"],
      colors: ["White", "Lavender"],
      tags: ["blouse", "linen", "spring", "romantic"],
      stock: 30,
      isFeatured: true,
      collectionSlug: "spring-bloom-2026",
      categorySlug: "tops-blouses",
    },
    {
      name: "Garden Party A-Line Skirt",
      description: "A playful A-line skirt in printed cotton sateen. The structured silhouette pairs effortlessly with tucked-in tops and delicate jewelry.",
      price: 195,
      material: "Cotton Sateen",
      fit: "High-waisted, true to size",
      care: "Machine wash gentle",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Floral Multi", "Ivory"],
      tags: ["skirt", "a-line", "spring", "cotton"],
      stock: 20,
      isFeatured: false,
      collectionSlug: "spring-bloom-2026",
      categorySlug: "bottoms",
    },
    {
      name: "Bloom Embroidered Cardigan",
      description: "Hand-embroidered floral details adorn this lightweight mohair-blend cardigan. A luxurious layering essential for transitional weather.",
      price: 320,
      comparePrice: 395,
      material: "70% Mohair, 30% Wool",
      fit: "Oversized",
      care: "Dry clean only",
      sizes: ["S", "M", "L"],
      colors: ["Cream", "Dusty Rose"],
      tags: ["cardigan", "embroidered", "spring", "knitwear"],
      stock: 15,
      isFeatured: true,
      collectionSlug: "spring-bloom-2026",
      categorySlug: "outerwear",
    },

    // Midnight Luxe
    {
      name: "Velvet Column Gown",
      description: "A show-stopping floor-length gown in sumptuous Italian velvet. The clean column silhouette is elevated with a dramatic open back.",
      longDesc: "This gown is the epitome of evening luxury. Cut from the finest Italian velvet with a subtle sheen, it skims the body with architectural precision.",
      price: 750,
      comparePrice: 890,
      material: "Italian Silk Velvet",
      fit: "Slim fit, true to size",
      care: "Professional dry clean only",
      sizes: ["XS", "S", "M", "L"],
      colors: ["Midnight Blue", "Burgundy", "Black"],
      tags: ["gown", "velvet", "evening", "luxury", "formal"],
      stock: 10,
      isFeatured: true,
      collectionSlug: "midnight-luxe",
      categorySlug: "dresses",
    },
    {
      name: "Satin Cowl Neck Camisole",
      description: "A sensual cowl-neck camisole in liquid satin. Delicate spaghetti straps and a bias cut create effortless elegance.",
      price: 165,
      material: "Silk Satin",
      fit: "Bias cut, runs slightly loose",
      care: "Hand wash cold",
      sizes: ["XS", "S", "M", "L"],
      colors: ["Champagne", "Black", "Ruby"],
      tags: ["camisole", "satin", "evening", "elegant"],
      stock: 35,
      isFeatured: true,
      collectionSlug: "midnight-luxe",
      categorySlug: "tops-blouses",
    },
    {
      name: "High-Waist Palazzo Trousers",
      description: "Wide-leg palazzo trousers with a nipped-in waist for a dramatic silhouette. The flowing crepe fabric moves beautifully with every stride.",
      price: 245,
      material: "Crepe de Chine",
      fit: "High-waisted, wide leg",
      care: "Dry clean recommended",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Black", "Ivory"],
      tags: ["trousers", "palazzo", "wide-leg", "evening"],
      stock: 22,
      isFeatured: false,
      collectionSlug: "midnight-luxe",
      categorySlug: "bottoms",
    },
    {
      name: "Crystal Embellished Clutch",
      description: "An exquisite evening clutch adorned with hand-placed crystal embellishments. Features a detachable chain strap for versatile styling.",
      price: 395,
      material: "Satin with Crystal Embellishments",
      fit: "One size",
      care: "Store in dust bag",
      sizes: [],
      colors: ["Silver", "Gold", "Black"],
      tags: ["clutch", "bag", "crystal", "evening", "accessory"],
      stock: 18,
      isFeatured: true,
      collectionSlug: "midnight-luxe",
      categorySlug: "accessories",
    },

    // Riviera Escape
    {
      name: "Linen Shirt Dress",
      description: "An effortless linen shirt dress with rolled sleeves and a relaxed fit. Button-front design transitions seamlessly from beach to bistro.",
      price: 225,
      material: "100% French Linen",
      fit: "Relaxed, oversized",
      care: "Machine wash cold",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["White", "Sky Blue", "Sand"],
      tags: ["dress", "linen", "shirt-dress", "resort", "summer"],
      stock: 28,
      isFeatured: true,
      collectionSlug: "riviera-escape",
      categorySlug: "dresses",
    },
    {
      name: "Striped Halter Top",
      description: "A Riviera-inspired halter top in nautical stripes. The cropped length and tied back detail exude Mediterranean chic.",
      price: 115,
      material: "Cotton Jersey",
      fit: "Cropped, true to size",
      care: "Machine wash cold",
      sizes: ["XS", "S", "M", "L"],
      colors: ["Navy/White", "Red/White"],
      tags: ["top", "halter", "striped", "summer", "resort"],
      stock: 40,
      isFeatured: false,
      collectionSlug: "riviera-escape",
      categorySlug: "tops-blouses",
    },
    {
      name: "Wide-Brim Straw Hat",
      description: "Hand-woven raffia straw hat with a generous brim for sun protection. Finished with a grosgrain ribbon band in signature rose.",
      price: 120,
      material: "Natural Raffia Straw",
      fit: "One size, adjustable inner band",
      care: "Spot clean only",
      sizes: [],
      colors: ["Natural", "Black"],
      tags: ["hat", "straw", "accessory", "summer", "resort"],
      stock: 25,
      isFeatured: true,
      collectionSlug: "riviera-escape",
      categorySlug: "accessories",
    },
    {
      name: "Espadrille Wedge Sandals",
      description: "Classic espadrille wedges with leather straps and a jute-wrapped platform. The ankle-tie closure adds a romantic finishing touch.",
      price: 195,
      material: "Italian Leather, Jute Sole",
      fit: "True to size",
      care: "Leather conditioner recommended",
      sizes: ["36", "37", "38", "39", "40", "41"],
      colors: ["Tan", "White", "Black"],
      tags: ["shoes", "espadrilles", "wedge", "sandal", "summer"],
      stock: 20,
      isFeatured: false,
      collectionSlug: "riviera-escape",
      categorySlug: "shoes",
    },

    // Minimal Noir
    {
      name: "Structured Wool Blazer",
      description: "An impeccably tailored single-breasted blazer in Italian virgin wool. Clean lines and a sharp shoulder create architectural elegance.",
      longDesc: "The foundation of a modern wardrobe. This blazer is cut from Italian virgin wool with just enough stretch for comfort. Fully lined with horn buttons.",
      price: 485,
      comparePrice: 580,
      material: "98% Virgin Wool, 2% Elastane",
      fit: "Tailored fit",
      care: "Dry clean only",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Black", "Charcoal"],
      tags: ["blazer", "wool", "tailored", "minimal", "workwear"],
      stock: 18,
      isFeatured: true,
      collectionSlug: "minimal-noir",
      categorySlug: "outerwear",
    },
    {
      name: "Silk Minimalist Slip Dress",
      description: "Pure simplicity in heavy-weight silk. This bias-cut slip dress skims the body with liquid grace, perfect for layering or wearing solo.",
      price: 325,
      material: "100% Mulberry Silk",
      fit: "Bias cut, true to size",
      care: "Dry clean recommended",
      sizes: ["XS", "S", "M", "L"],
      colors: ["Black", "Ivory", "Nude"],
      tags: ["dress", "slip", "silk", "minimal", "elegant"],
      stock: 20,
      isFeatured: true,
      collectionSlug: "minimal-noir",
      categorySlug: "dresses",
    },
    {
      name: "Cashmere Crew Neck Sweater",
      description: "Ultra-soft Grade A cashmere in a clean crew neck silhouette. A timeless investment piece that improves with every wear.",
      price: 275,
      material: "100% Grade A Cashmere",
      fit: "Regular fit",
      care: "Hand wash cold or dry clean",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Black", "Heather Grey", "Camel"],
      tags: ["sweater", "cashmere", "minimal", "knitwear"],
      stock: 30,
      isFeatured: false,
      collectionSlug: "minimal-noir",
      categorySlug: "tops-blouses",
    },
    {
      name: "Tailored Wide-Leg Trousers",
      description: "Masterfully cut wide-leg trousers with front pleats and a high rise. The fluid silhouette creates a long, lean line.",
      price: 265,
      material: "Wool Blend Crepe",
      fit: "High-rise, wide leg",
      care: "Dry clean only",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Black", "Navy"],
      tags: ["trousers", "tailored", "wide-leg", "minimal", "workwear"],
      stock: 25,
      isFeatured: false,
      collectionSlug: "minimal-noir",
      categorySlug: "bottoms",
    },

    // Rose Heritage
    {
      name: "Heritage Rose Print Dress",
      description: "Our signature rose print in a timeless fit-and-flare silhouette. Structured bodice with a sweetheart neckline flows into a full skirt.",
      price: 345,
      comparePrice: 420,
      material: "Silk Taffeta",
      fit: "Fitted bodice, flared skirt",
      care: "Dry clean only",
      sizes: ["XS", "S", "M", "L"],
      colors: ["Rose Print", "Burgundy"],
      tags: ["dress", "rose", "print", "heritage", "feminine"],
      stock: 15,
      isFeatured: true,
      collectionSlug: "rose-heritage",
      categorySlug: "dresses",
    },
    {
      name: "Bow-Tie Silk Blouse",
      description: "A refined pussy-bow blouse in lustrous silk crepe. The tied neckline adds a vintage-inspired detail to this polished essential.",
      price: 195,
      material: "Silk Crepe de Chine",
      fit: "Regular fit",
      care: "Dry clean recommended",
      sizes: ["XS", "S", "M", "L"],
      colors: ["Blush", "Cream", "Black"],
      tags: ["blouse", "silk", "bow-tie", "heritage", "elegant"],
      stock: 28,
      isFeatured: true,
      collectionSlug: "rose-heritage",
      categorySlug: "tops-blouses",
    },
    {
      name: "Quilted Leather Shoulder Bag",
      description: "A structured shoulder bag in buttery quilted lambskin leather. Gold-tone hardware and a chain-link strap echo timeless luxury.",
      price: 520,
      material: "Lambskin Leather",
      fit: "One size, adjustable strap",
      care: "Store in dust bag, avoid water",
      sizes: [],
      colors: ["Blush Pink", "Black", "Cream"],
      tags: ["bag", "leather", "quilted", "heritage", "luxury"],
      stock: 12,
      isFeatured: true,
      collectionSlug: "rose-heritage",
      categorySlug: "accessories",
    },
    {
      name: "Pointed Toe Kitten Heels",
      description: "Elegant pointed-toe kitten heels in supple Italian leather. The 50mm heel provides comfort without compromising on sophistication.",
      price: 245,
      material: "Italian Nappa Leather",
      fit: "True to size",
      care: "Leather conditioner recommended",
      sizes: ["36", "37", "38", "39", "40", "41"],
      colors: ["Nude", "Black", "Burgundy"],
      tags: ["shoes", "heels", "kitten-heel", "elegant", "heritage"],
      stock: 20,
      isFeatured: false,
      collectionSlug: "rose-heritage",
      categorySlug: "shoes",
    },

    // Urban Edge
    {
      name: "Oversized Denim Jacket",
      description: "A reimagined classic — the oversized denim jacket with raw hems and vintage-wash treatment. Perfectly imperfect for effortless cool.",
      price: 225,
      material: "100% Cotton Denim",
      fit: "Oversized",
      care: "Machine wash cold, tumble dry low",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Vintage Blue", "Black"],
      tags: ["jacket", "denim", "oversized", "urban", "streetwear"],
      stock: 22,
      isFeatured: false,
      collectionSlug: "urban-edge",
      categorySlug: "outerwear",
    },
    {
      name: "Cropped Cargo Pants",
      description: "Utilitarian cargo pants with a modern cropped length. Multiple pockets and a relaxed tapered fit combine function with street style.",
      price: 175,
      material: "Cotton Twill",
      fit: "Relaxed tapered, mid-rise",
      care: "Machine wash cold",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Olive", "Black", "Sand"],
      tags: ["pants", "cargo", "cropped", "urban", "utility"],
      stock: 30,
      isFeatured: false,
      collectionSlug: "urban-edge",
      categorySlug: "bottoms",
    },
    {
      name: "Leather Platform Boots",
      description: "Bold platform boots in polished leather with a chunky rubber sole. A statement piece that anchors any urban outfit with authority.",
      price: 385,
      material: "Full-Grain Leather, Rubber Sole",
      fit: "True to size",
      care: "Leather cleaner and conditioner",
      sizes: ["36", "37", "38", "39", "40", "41"],
      colors: ["Black", "White"],
      tags: ["boots", "platform", "leather", "urban", "statement"],
      stock: 15,
      isFeatured: false,
      collectionSlug: "urban-edge",
      categorySlug: "shoes",
    },
    {
      name: "Graphic Mesh Layering Top",
      description: "A sheer mesh top with abstract graphic print. Designed for layering over bralettes or under oversized pieces for a street-style edge.",
      price: 95,
      material: "Nylon Mesh",
      fit: "Fitted",
      care: "Hand wash cold",
      sizes: ["XS", "S", "M", "L"],
      colors: ["Black/White", "Black/Red"],
      tags: ["top", "mesh", "graphic", "urban", "layering"],
      stock: 35,
      isFeatured: false,
      collectionSlug: "urban-edge",
      categorySlug: "tops-blouses",
    },
  ];

  let insertedCount = 0;
  for (const p of productData) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
    const existing = await productsCol.findOne({ slug });
    if (existing) {
      console.log(`  ⏭ Product "${p.name}" already exists, skipping`);
      continue;
    }

    const col = findCol(p.collectionSlug);
    const cat = findCat(p.categorySlug);
    const count = await productsCol.countDocuments();

    const doc = {
      _id: new ObjectId(),
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: p.name,
      slug,
      description: p.description || null,
      longDesc: p.longDesc || null,
      price: p.price,
      comparePrice: p.comparePrice || null,
      sku: null,
      stock: p.stock || 0,
      isFeatured: p.isFeatured || false,
      isArchived: false,
      isActive: true,
      order: count + 1,
      categoryId: cat ? cat._id.toString() : null,
      collectionId: col ? col._id.toString() : null,
      images: [
        {
          id: `img_${Date.now()}_0`,
          url: PH,
          altText: p.name,
          order: 0,
          isPrimary: true,
          width: 800,
          height: 1000,
        },
      ],
      material: p.material || null,
      fit: p.fit || null,
      care: p.care || null,
      sizes: p.sizes || [],
      colors: p.colors || [],
      tags: p.tags || [],
      variants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await productsCol.insertOne(doc);
    insertedCount++;
    console.log(`  ✅ Product: ${p.name} → /products/${slug}`);
    await new Promise(r => setTimeout(r, 10));
  }

  // ─── Summary ────────────────────────────────────
  const finalCollections = await collectionsCol.countDocuments();
  const finalCategories = await categoriesCol.countDocuments();
  const finalProducts = await productsCol.countDocuments();

  console.log("\n═══════════════════════════════════════");
  console.log("✨ Seed complete!");
  console.log(`  Collections: ${finalCollections}`);
  console.log(`  Categories:  ${finalCategories}`);
  console.log(`  Products:    ${finalProducts} (${insertedCount} new)`);
  console.log("═══════════════════════════════════════\n");
  console.log("📸 All products have placeholder images.");
  console.log("   Update them via Admin Panel → Products → Edit → Images\n");

  await client.close();
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
