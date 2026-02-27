const fs = require('fs');

let content = fs.readFileSync('src/lib/db.ts', 'utf-8');

// 1. Add fs and path imports
if (!content.includes('import fs from "fs"')) {
  content = content.replace('import type { Role, OrderStatus } from "@/types";', 'import type { Role, OrderStatus } from "@/types";\nimport fs from "fs";\nimport path from "path";');
}

// 2. Replace hardcoded arrays with JSON loading
const replacement = `
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
`;

// Extract from "const productImages" down to "export const db = {"
const startIdx = content.indexOf('const productImages: Record<string, ProductImage[]> = {');
const endIdx = content.indexOf('export const db = {');

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + replacement + '\n' + content.substring(endIdx);
}

// 3. Add saveDB() to mutating methods.
const methodsToPatch = [
  'createUser',
  'createOrder',
  'createProduct',
  'updateProduct',
  'deleteProduct',
  'createCategory',
  'createCollection'
];

methodsToPatch.forEach(method => {
  // We want to add saveDB(); right before 'return' in each method.
  // This is a bit tricky with regex, simpler to replace the return statement with saveDB(); return
  // But each method might have multiple returns.
  // Actually, we can just find "users.push(user);", "products.push(product);", "products[index] = ..."
  // Let's do string replacements for known mutation points.
});

// Manual replacement of known mutation points:
content = content.replace('users.push(user);\n    return user;', 'users.push(user);\n    saveDB();\n    return user;');
content = content.replace('orders.push(order);\n    return order;', 'orders.push(order);\n    saveDB();\n    return order;');
content = content.replace('products.push(product);\n    return product;', 'products.push(product);\n    saveDB();\n    return product;');
content = content.replace('products[index] = { ...products[index], ...data, updatedAt: new Date() };\n    return products[index];', 'products[index] = { ...products[index], ...data, updatedAt: new Date() };\n    saveDB();\n    return products[index];');
content = content.replace('products[index].isArchived = true;\n    products[index].isActive = false;\n    return true;', 'products[index].isArchived = true;\n    products[index].isActive = false;\n    saveDB();\n    return true;');
content = content.replace('categories.push(category);\n    return category;', 'categories.push(category);\n    saveDB();\n    return category;');
content = content.replace('collections.push(collection);\n    return collection;', 'collections.push(collection);\n    saveDB();\n    return collection;');

// Need to update `export const db = {` to include homeConfig and saveDB so we can use it
content = content.replace('export const db = {', 'export const db = {\n  homeConfig,\n  saveDB,');

fs.writeFileSync('src/lib/db.ts', content);
console.log('db.ts patched');
