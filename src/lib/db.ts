import type { Product, Category, Collection, Order, User, Media, ProductImage } from "@/types";
import type { Role, OrderStatus } from "@/types";
import fs from "fs";
import path from "path";


const DATA_FILE = path.join(process.cwd(), "data.json");
let state: any = {};
try {
  if (fs.existsSync(DATA_FILE)) {
    state = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } else {
    // Failsafe empty state
    state = { productImages: {}, categories: [], collections: [], products: [], users: [], orders: [], media: [], seoData: {}, homeConfig: {} };
  }
} catch (e) {
  console.error("Error loading DB", e);
  state = { productImages: {}, categories: [], collections: [], products: [], users: [], orders: [], media: [], seoData: {}, homeConfig: {} };
}

export const productImages: Record<string, ProductImage[]> = state.productImages || {};
export const categories: Category[] = state.categories || [];
export const collections: Collection[] = state.collections || [];
export const products: Product[] = state.products || [];
export const users: User[] = state.users || [];
export const orders: Order[] = state.orders || [];
export const media: Media[] = state.media || [];
export const seoData: any = state.seoData || {};
export const homeConfig: any = state.homeConfig || { hero: null };

export function saveDB() {
  state.products = products;
  state.categories = categories;
  state.collections = collections;
  state.users = users;
  state.orders = orders;
  state.media = media;
  state.seoData = seoData;
  state.productImages = productImages;
  state.homeConfig = homeConfig;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error("Failed to save DB", err);
  }
}

export const db = {
  homeConfig,
  saveDB,
  products,
  categories,
  collections,
  users,
  orders,
  media,
  seoData,

  productImages,

  getProducts(options: {
    page?: number;
    perPage?: number;
    category?: string;
    collection?: string;
    featured?: boolean;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  } = {}) {
    let filtered = products.filter(p => p.isActive && !p.isArchived);

    if (options.category) {
      filtered = filtered.filter(p => p.category?.slug === options.category);
    }
    if (options.collection) {
      filtered = filtered.filter(p => p.collection?.slug === options.collection);
    }
    if (options.featured) {
      filtered = filtered.filter(p => p.isFeatured);
    }
    if (options.search) {
      const search = options.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        p.tags.some(t => t.toLowerCase().includes(search))
      );
    }
    if (options.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= options.minPrice!);
    }
    if (options.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= options.maxPrice!);
    }

    const sort = options.sort || "order";
    if (sort === "price_asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      filtered.sort((a, b) => a.order - b.order);
    }

    const page = options.page || 1;
    const perPage = options.perPage || 24;
    const skip = (page - 1) * perPage;
    const items = filtered.slice(skip, skip + perPage);

    return {
      items,
      total: filtered.length,
      page,
      perPage,
      totalPages: Math.ceil(filtered.length / perPage),
    };
  },

  getProductBySlug(slug: string) {
    return products.find(p => p.slug === slug && p.isActive) || null;
  },

  getProductById(id: string) {
    return products.find(p => p.id === id) || null;
  },

  getCategories(options: { includeInactive?: boolean } = {}) {
    let filtered = categories;
    if (!options.includeInactive) {
      filtered = filtered.filter(c => c.isActive);
    }
    return filtered.sort((a, b) => a.order - b.order);
  },

  getCategoryBySlug(slug: string) {
    return categories.find(c => c.slug === slug) || null;
  },

  getCollections(options: { featured?: boolean; includeInactive?: boolean } = {}) {
    let filtered = collections;
    if (!options.includeInactive) {
      filtered = filtered.filter(c => c.isActive);
    }
    if (options.featured) {
      filtered = filtered.filter(c => c.isFeatured);
    }
    return filtered.sort((a, b) => a.order - b.order);
  },

  getCollectionBySlug(slug: string) {
    return collections.find(c => c.slug === slug) || null;
  },

  getUserByEmail(email: string) {
    return users.find(u => u.email === email) || null;
  },

  getUserById(id: string) {
    return users.find(u => u.id === id) || null;
  },

  createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
    avatar?: string;
  }) {
    const existing = users.find(u => u.email === data.email);
    if (existing) {
      throw new Error("Email already exists");
    }

    const user: User = {
      id: `user_${Date.now()}`,
      email: data.email,
      name: data.name,
      role: data.role || "CUSTOMER",
      avatar: data.avatar || null,
      password: data.password,
      createdAt: new Date(),
    };

    users.push(user);
    saveDB();
    return user;
  },

  createOrder(data: {
    items: Array<{ productId: string; quantity: number; price: number; size?: string | null; color?: string | null }>;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    shippingCost?: number;
    discount?: number;
  }) {
    const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const shippingCost = data.shippingCost || 0;
    const discount = data.discount || 0;
    const total = subtotal + shippingCost + tax - discount;

    const orderNumber = `RL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const order: Order = {
      id: `order_${Date.now()}`,
      orderNumber,
      userId: null,
      status: "PENDING" as OrderStatus,
      total,
      subtotal,
      shippingCost,
      tax,
      discount,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone ?? null,
      address: data.address,
      city: data.city,
      state: data.state ?? null,
      postalCode: data.postalCode,
      country: data.country,
      items: data.items.map(item => {
        const product = products.find(p => p.id === item.productId)!;
        return {
          id: `orderitem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          productId: item.productId,
          product,
          quantity: item.quantity,
          price: item.price,
          size: item.size || null,
          color: item.color || null,
        };
      }),
      createdAt: new Date(),
    };

    orders.push(order);
    saveDB();
    return order;
  },

  getOrders(options: { userId?: string; page?: number; perPage?: number } = {}) {
    let filtered = [...orders];
    
    if (options.userId) {
      filtered = filtered.filter(o => o.userId === options.userId);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = options.page || 1;
    const perPage = options.perPage || 20;
    const skip = (page - 1) * perPage;
    const items = filtered.slice(skip, skip + perPage);

    return {
      items,
      total: filtered.length,
      page,
      perPage,
      totalPages: Math.ceil(filtered.length / perPage),
    };
  },

  getOrderById(id: string) {
    return orders.find(o => o.id === id) || null;
  },

  getOrderByNumber(orderNumber: string) {
    return orders.find(o => o.orderNumber === orderNumber) || null;
  },

  createProduct(data: {
    name: string;
    slug?: string;
    description?: string;
    longDesc?: string;
    price: number;
    comparePrice?: number;
    sku?: string;
    stock?: number;
    isFeatured?: boolean;
    categoryId?: string;
    collectionId?: string;
    material?: string;
    fit?: string;
    care?: string;
    sizes?: string[];
    colors?: string[];
    tags?: string[];
    images?: string[];
  }) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
    
    const existing = products.find(p => p.slug === slug);
    if (existing) {
      throw new Error("Slug already exists");
    }

    const category = data.categoryId ? categories.find(c => c.id === data.categoryId) || null : null;
    const collection = data.collectionId ? collections.find(c => c.id === data.collectionId) || null : null;

    const newImages: ProductImage[] = (data.images || []).map((url, idx) => ({
      id: `img_${Date.now()}_${idx}`,
      url,
      altText: data.name,
      order: idx,
      isPrimary: idx === 0,
      width: 800,
      height: 1000,
    }));

    const product: Product = {
      id: `prod_${Date.now()}`,
      name: data.name,
      slug,
      description: data.description || null,
      longDesc: data.longDesc || null,
      price: data.price,
      comparePrice: data.comparePrice || null,
      sku: data.sku || null,
      stock: data.stock || 0,
      isFeatured: data.isFeatured || false,
      isArchived: false,
      isActive: true,
      order: products.length + 1,
      categoryId: data.categoryId || null,
      collectionId: data.collectionId || null,
      category,
      collection,
      images: newImages,
      material: data.material || null,
      fit: data.fit || null,
      care: data.care || null,
      sizes: data.sizes || [],
      colors: data.colors || [],
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    products.push(product);
    saveDB();
    return product;
  },

  updateProduct(id: string, data: Partial<Product>) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    products[index] = { ...products[index], ...data, updatedAt: new Date() };
    saveDB();
    return products[index];
  },

  deleteProduct(id: string) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    products[index].isArchived = true;
    products[index].isActive = false;
    saveDB();
    return true;
  },

  createCategory(data: {
    name: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    parentId?: string | null;
    order?: number;
    isActive?: boolean;
  }) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
    
    const existing = categories.find(c => c.slug === slug);
    if (existing) {
      throw new Error("Slug already exists");
    }

    const category: Category = {
      id: `cat_${Date.now()}`,
      name: data.name,
      slug,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      parentId: data.parentId || null,
      order: data.order ?? categories.length + 1,
      isActive: data.isActive ?? true,
    };

    categories.push(category);
    saveDB();
    return category;
  },

  createCollection(data: {
    name: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    videoUrl?: string;
    season?: string;
    year?: number;
    isFeatured?: boolean;
    isActive?: boolean;
    order?: number;
  }) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
    
    const existing = collections.find(c => c.slug === slug);
    if (existing) {
      throw new Error("Slug already exists");
    }

    const collection: Collection = {
      id: `col_${Date.now()}`,
      name: data.name,
      slug,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      videoUrl: data.videoUrl || null,
      season: data.season || null,
      year: data.year ?? null,
      isFeatured: data.isFeatured ?? false,
      isActive: data.isActive ?? true,
      order: data.order ?? collections.length + 1,
    };

    collections.push(collection);
    saveDB();
    return collection;
  },
};
