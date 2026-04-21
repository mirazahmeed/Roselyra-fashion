// Shared TypeScript types for ROSELYRA platform

import { ObjectId } from "mongodb";

export type Role = "CUSTOMER" | "EDITOR" | "ADMIN";

export type WithId<T> = T & { _id: ObjectId };
export type WithoutId<T> = Omit<T, "_id">;

export type OrderStatus =
	| "PENDING"
	| "PAYMENT_SUBMITTED"
	| "CONFIRMED"
	| "PROCESSING"
	| "SHIPPED"
	| "DELIVERED"
	| "CANCELLED"
	| "REFUNDED";

export type PaymentType = "COD" | "FULL" | "ADVANCE";
export type PaymentMethod = "BKASH" | "COD" | "CARD";
export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface EmailVerification {
	_id?: ObjectId;
	id: string;
	email: string;
	token: string;
	expiresAt: Date;
	createdAt: Date;
}

// ─── User ─────────────────────────────────────────
export interface User {
	_id?: ObjectId;
	id: string;
	email: string;
	name: string | null;
	role: Role;
	avatar: string | null;
	password?: string;
	emailVerified: boolean;
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
	_id?: ObjectId;
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
	_id?: ObjectId;
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

// ─── Product Variant ───────────────────────────────
export interface ProductVariant {
	id: string;
	color: string;
	size: string;
	sku: string | null;
	stock: number;
	price: number | null;
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
	_id?: ObjectId;
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
	variants: ProductVariant[];
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
	product?: Product;
	quantity: number;
	price: number;
	size: string | null;
	color: string | null;
}

export interface Order {
	_id?: ObjectId;
	id: string;
	orderNumber: string;
	userId: string | null;
	guestEmail: string | null;
	status: OrderStatus;
	paymentType: PaymentType;
	paymentMethod: PaymentMethod;
	subtotal: number;
	shippingCost: number;
	tax: number;
	discount: number;
	paidAmount: number;
	dueAmount: number;
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
	adminNotes: string | null;
	createdAt: Date;
	updatedAt: Date;
}

// ─── Payment ────────────────────────────────────────
export interface Payment {
	_id?: ObjectId;
	id: string;
	orderId: string;
	method: PaymentMethod;
	senderNumber: string | null;
	transactionId: string | null;
	amount: number;
	status: PaymentStatus;
	adminNotes: string | null;
	createdAt: Date;
	updatedAt: Date;
}

// ─── Settings ────────────────────────────────────────
export interface SiteSettings {
	bkashNumber: string;
	bkashMerchantNumber: string;
	deliveryCharge: number;
	minAdvanceAmount: number;
	codEnabled: boolean;
	storeName: string;
	storeLogo: string | null;
	storeEmail: string;
	storePhone: string;
	storeAddress: string;
	footerText: string;
}

// ─── Media ────────────────────────────────────────
export interface Media {
	_id?: ObjectId;
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
