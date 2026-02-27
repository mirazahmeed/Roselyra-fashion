// Shared TypeScript types for ROSELYRA platform

export type Role = "CUSTOMER" | "EDITOR" | "ADMIN";

export type OrderStatus =
	| "PENDING"
	| "CONFIRMED"
	| "PROCESSING"
	| "SHIPPED"
	| "DELIVERED"
	| "CANCELLED"
	| "REFUNDED";

// ─── User ─────────────────────────────────────────
export interface User {
	id: string;
	email: string;
	name: string | null;
	role: Role;
	avatar: string | null;
	password?: string;
	createdAt: Date;
}

// ─── Auth ─────────────────────────────────────────
export interface AuthUser {
	id: string;
	email: string;
	name: string | null;
	role: Role;
	avatar: string | null;
}

// ─── Category ─────────────────────────────────────
export interface Category {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	imageUrl: string | null;
	parentId: string | null;
	children?: Category[];
	order: number;
	isActive: boolean;
}

// ─── Collection ───────────────────────────────────
export interface Collection {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	imageUrl: string | null;
	videoUrl: string | null;
	season: string | null;
	year: number | null;
	isFeatured: boolean;
	isActive: boolean;
	order: number;
}

// ─── Product ──────────────────────────────────────
export interface ProductImage {
	id: string;
	url: string;
	altText: string | null;
	order: number;
	isPrimary: boolean;
	width: number | null;
	height: number | null;
}

export interface Product {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	longDesc: string | null;
	price: number;
	comparePrice: number | null;
	sku: string | null;
	stock: number;
	isFeatured: boolean;
	isArchived: boolean;
	isActive: boolean;
	order: number;
	categoryId: string | null;
	collectionId: string | null;
	category?: Category | null;
	collection?: Collection | null;
	images: ProductImage[];
	material: string | null;
	fit: string | null;
	care: string | null;
	sizes: string[];
	colors: string[];
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
}

// ─── Cart ─────────────────────────────────────────
export interface CartItem {
	id: string;
	productId: string;
	product: Product;
	quantity: number;
	size: string | null;
	color: string | null;
}

// Local cart item (Zustand, no server)
export interface LocalCartItem {
	product: Product;
	quantity: number;
	size: string | null;
	color: string | null;
}

// ─── Order ────────────────────────────────────────
export interface OrderItem {
	id: string;
	productId: string;
	product: Product;
	quantity: number;
	price: number;
	size: string | null;
	color: string | null;
}

export interface Order {
	id: string;
	orderNumber: string;
	userId: string | null;
	status: OrderStatus;
	total: number;
	subtotal: number;
	shippingCost: number;
	tax: number;
	discount: number;
	firstName: string;
	lastName: string;
	email: string;
	phone: string | null;
	address: string;
	city: string;
	state: string | null;
	postalCode: string;
	country: string;
	items: OrderItem[];
	createdAt: Date;
}

// ─── Media ────────────────────────────────────────
export interface Media {
	id: string;
	url: string;
	publicId: string | null;
	altText: string | null;
	type: "IMAGE" | "VIDEO";
	width: number | null;
	height: number | null;
	size: number | null;
	mimeType: string | null;
	folder: string | null;
	createdAt: Date;
}

// ─── PageContent ──────────────────────────────────
export interface PageContent {
	id: string;
	key: string;
	title: string | null;
	subtitle: string | null;
	body: string | null;
	imageUrl: string | null;
	videoUrl: string | null;
	linkUrl: string | null;
	linkText: string | null;
	order: number;
	isActive: boolean;
	section: string | null;
}

// ─── API Responses ────────────────────────────────
export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	perPage: number;
	totalPages: number;
}

// ─── Forms ────────────────────────────────────────
export interface CheckoutFormData {
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	address: string;
	city: string;
	state?: string;
	postalCode: string;
	country: string;
}

export interface LoginFormData {
	email: string;
	password: string;
}

export interface RegisterFormData {
	name: string;
	email: string;
	password: string;
}

export interface ProductFormData {
	name: string;
	slug: string;
	description?: string;
	longDesc?: string;
	price: number;
	comparePrice?: number;
	sku?: string;
	stock: number;
	isFeatured: boolean;
	categoryId?: string;
	collectionId?: string;
	material?: string;
	fit?: string;
	care?: string;
	sizes: string[];
	colors: string[];
	tags: string[];
}
