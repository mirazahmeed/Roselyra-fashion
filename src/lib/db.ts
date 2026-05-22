import { Db, Collection, ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import type {
	Product,
	Category,
	Collection as CollectionType,
	Order,
	User,
	Media,
	Payment,
	SiteSettings,
	EmailVerification,
	Role,
	OrderStatus,
	PaymentType,
	PaymentMethod,
	PaymentStatus,
} from "@/types";

const globalForDb = globalThis as unknown as { _dbCollections: Db | null };

async function getCollections() {
	if (!globalForDb._dbCollections) globalForDb._dbCollections = await getDb();
	const mongoDb = globalForDb._dbCollections;
	return {
		products: mongoDb.collection<Product>("products"),
		categories: mongoDb.collection<Category>("categories"),
		collections: mongoDb.collection<CollectionType>("collections"),
		orders: mongoDb.collection<Order>("orders"),
		users: mongoDb.collection<User>("users"),
		media: mongoDb.collection<Media>("media"),
		payments: mongoDb.collection<Payment>("payments"),
		settings: mongoDb.collection<SiteSettings>("settings"),
		emailVerifications:
			mongoDb.collection<EmailVerification>("emailVerifications"),
	};
}

const defaultSettings: SiteSettings = {
	bkashNumber: "",
	bkashMerchantNumber: "",
	deliveryCharge: 100,
	minAdvanceAmount: 100,
	codEnabled: true,
	storeName: "Roselyra",
	storeLogo: null,
	storeEmail: "contact@roselyra.com",
	storePhone: "+8801XXXXXXXXX",
	storeAddress: "",
	footerText: "© 2026 Roselyra. All rights reserved.",
};

function getIdFilter(id: string) {
	return /^[0-9a-f]{24}$/i.test(id) ? { _id: new ObjectId(id) } : { id };
}

export const mongoMethods = {
	async getSettings() {
		const { settings } = await getCollections();
		const result = await settings.findOne({
			_id: new ObjectId("000000000000000000000001"),
		});
		return result || defaultSettings;
	},

	async getHomeConfig() {
		return this.getSettings().then((s) => ({}) as any);
	},

	async getMediaAll(
		options: {
			type?: "IMAGE" | "VIDEO";
			page?: number;
			perPage?: number;
		} = {},
	) {
		return this.getMedia(options);
	},

	async getAllOrders(
		options: { userId?: string; page?: number; perPage?: number } = {},
	) {
		return this.getOrders(options);
	},

	async getAllUsers() {
		return Promise.resolve([] as User[]);
	},

	async getMediaList() {
		const result = await this.getMedia({ perPage: 1000 });
		return result.items;
	},

	async getOrdersList() {
		const result = await this.getOrders({ perPage: 1000 });
		return result.items;
	},

	async updateSettings(data: Partial<SiteSettings>) {
		const { settings } = await getCollections();
		const { _id, ...updateData } = data as any;
		await settings.updateOne(
			{ _id: new ObjectId("000000000000000000000001") },
			{ $set: { ...updateData } },
			{ upsert: true },
		);
		return this.getSettings();
	},

	async getProducts(
		options: {
			page?: number;
			perPage?: number;
			category?: string;
			collection?: string;
			featured?: boolean;
			search?: string;
			sort?: string;
			minPrice?: number;
			maxPrice?: number;
		} = {},
	) {
		const { products, categories, collections } = await getCollections();
		const filter: Record<string, unknown> = {
			isActive: true,
			isArchived: { $ne: true },
		};

		if (options.category) {
			const cat = await categories.findOne({ slug: options.category });
			if (cat) filter.categoryId = cat._id?.toString();
		}
		if (options.collection) {
			const col = await collections.findOne({ slug: options.collection });
			if (col) filter.collectionId = col._id?.toString();
		}
		if (options.featured) filter.isFeatured = true;
		if (options.search) {
			filter.$or = [
				{ name: { $regex: options.search, $options: "i" } },
				{ description: { $regex: options.search, $options: "i" } },
				{ tags: { $regex: options.search, $options: "i" } },
			];
		}
		if (options.minPrice) filter.price = { $gte: options.minPrice };
		if (options.maxPrice) {
			filter.price = {
				...(filter.price as Record<string, number>),
				$lte: options.maxPrice,
			};
		}

		const sort: Record<string, 1 | -1> = {};
		switch (options.sort) {
			case "price_asc":
				sort.price = 1;
				break;
			case "price_desc":
				sort.price = -1;
				break;
			case "newest":
				sort.createdAt = -1;
				break;
			default:
				sort.order = 1;
		}

		const page = options.page || 1;
		const perPage = options.perPage || 24;
		const skip = (page - 1) * perPage;

		const [items, total] = await Promise.all([
			products
				.find(filter)
				.sort(sort)
				.skip(skip)
				.limit(perPage)
				.toArray(),
			products.countDocuments(filter),
		]);

		// Batch-load categories and collections to avoid N+1 queries
		const categoryIds = Array.from(new Set(items.map(i => i.categoryId).filter(Boolean))) as string[];
		const collectionIds = Array.from(new Set(items.map(i => i.collectionId).filter(Boolean))) as string[];

		const [catDocs, colDocs] = await Promise.all([
			categoryIds.length > 0
				? categories.find({ _id: { $in: categoryIds.map(id => new ObjectId(id)) } }).toArray()
				: Promise.resolve([]),
			collectionIds.length > 0
				? collections.find({ _id: { $in: collectionIds.map(id => new ObjectId(id)) } }).toArray()
				: Promise.resolve([]),
		]);

		const catMap = new Map(catDocs.map(c => [c._id!.toString(), c]));
		const colMap = new Map(colDocs.map(c => [c._id!.toString(), c]));

		for (const item of items) {
			if (item.categoryId) {
				item.category = catMap.get(item.categoryId) || undefined;
			}
			if (item.collectionId) {
				item.collection = colMap.get(item.collectionId) || undefined;
			}
		}

		return {
			items,
			total,
			page,
			perPage,
			totalPages: Math.ceil(total / perPage),
		};
	},

	async getProductBySlug(slug: string) {
		const { products, categories, collections } = await getCollections();
		const product = await products.findOne({ slug, isActive: true });
		if (product && product.categoryId) {
			product.category =
				(await categories.findOne({
					_id: new ObjectId(product.categoryId),
				})) || undefined;
		}
		if (product && product.collectionId) {
			product.collection =
				(await collections.findOne({
					_id: new ObjectId(product.collectionId),
				})) || undefined;
		}
		return product;
	},

	async getProductById(id: string) {
		const { products, categories, collections } = await getCollections();
		const product = await products.findOne(getIdFilter(id) as any);
		if (product && product.categoryId) {
			product.category =
				(await categories.findOne({
					_id: new ObjectId(product.categoryId),
				})) || undefined;
		}
		if (product && product.collectionId) {
			product.collection =
				(await collections.findOne({
					_id: new ObjectId(product.collectionId),
				})) || undefined;
		}
		return product;
	},

	async getCategories(options: { includeInactive?: boolean } = {}) {
		const { categories } = await getCollections();
		const filter = options.includeInactive ? {} : { isActive: true };
		return categories.find(filter).sort({ order: 1 }).toArray();
	},

	async getCategoryBySlug(slug: string) {
		const { categories } = await getCollections();
		return categories.findOne({ slug });
	},

	async getCollections(
		options: { featured?: boolean; includeInactive?: boolean } = {},
	) {
		const { collections } = await getCollections();
		const filter: Record<string, unknown> =
			options.includeInactive ? {} : { isActive: true };
		if (options.featured) filter.isFeatured = true;
		return collections.find(filter).sort({ order: 1 }).toArray();
	},

	async getCollectionBySlug(slug: string) {
		const { collections } = await getCollections();
		return collections.findOne({ slug });
	},

	async getUserByEmail(email: string) {
		const { users } = await getCollections();
		return users.findOne({ email });
	},

	async getUserById(id: string) {
		const { users } = await getCollections();
		return users.findOne(getIdFilter(id) as any);
	},

	async createUser(data: {
		name: string;
		email: string;
		password: string;
		role?: Role;
		avatar?: string;
	}) {
		const { users } = await getCollections();
		const existing = await users.findOne({ email: data.email });
		if (existing) throw new Error("Email already exists");

		const user = {
			_id: new ObjectId(),
			id: `user_${Date.now()}`,
			email: data.email,
			name: data.name,
			role: data.role || "CUSTOMER",
			avatar: data.avatar || null,
			password: data.password,
			emailVerified: false,
			createdAt: new Date(),
		};

		await users.insertOne(user as User & { _id: ObjectId });
		const { _id, ...result } = user;
		return result as User;
	},

	async createOrder(data: {
		items: Array<{
			productId: string;
			quantity: number;
			price: number;
			size?: string | null;
			color?: string | null;
		}>;
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
		paymentType?: PaymentType;
		paymentMethod?: PaymentMethod;
		paidAmount?: number;
		userId?: string | null;
		guestEmail?: string | null;
	}) {
		const { orders, products } = await getCollections();
		const subtotal = data.items.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0,
		);
		const tax = subtotal * 0.1;
		const shippingCost = data.shippingCost || 0;
		const discount = data.discount || 0;
		const paidAmount = data.paidAmount || 0;
		const dueAmount = subtotal + shippingCost + tax - discount - paidAmount;

		const orderNumber = `RL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

		const orderItems = await Promise.all(
			data.items.map(async (item) => {
				const product = await products.findOne(
					getIdFilter(item.productId) as any,
				);
				return {
					id: `orderitem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
					productId: item.productId,
					product: product || undefined,
					quantity: item.quantity,
					price: item.price,
					size: item.size || null,
					color: item.color || null,
				};
			}),
		);

		const order: Order = {
			_id: new ObjectId(),
			id: `order_${Date.now()}`,
			orderNumber,
			userId: data.userId || null,
			guestEmail: data.guestEmail || null,
			status: "PENDING" as OrderStatus,
			paymentType: data.paymentType || "FULL",
			paymentMethod: data.paymentMethod || "BKASH",
			subtotal,
			shippingCost,
			tax,
			discount,
			paidAmount,
			dueAmount,
			firstName: data.firstName,
			lastName: data.lastName,
			email: data.email,
			phone: data.phone ?? null,
			address: data.address,
			city: data.city,
			state: data.state ?? null,
			postalCode: data.postalCode,
			country: data.country,
			items: orderItems,
			adminNotes: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		await orders.insertOne(order as Order & { _id: ObjectId });
		return order;
	},

	async getOrders(
		options: { userId?: string; page?: number; perPage?: number } = {},
	) {
		const { orders } = await getCollections();
		const filter = options.userId ? { userId: options.userId } : {};

		const page = options.page || 1;
		const perPage = options.perPage || 20;
		const skip = (page - 1) * perPage;

		const [items, total] = await Promise.all([
			orders
				.find(filter)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(perPage)
				.toArray(),
			orders.countDocuments(filter),
		]);

		return {
			items,
			total,
			page,
			perPage,
			totalPages: Math.ceil(total / perPage),
		};
	},

	async getOrderById(id: string) {
		const { orders } = await getCollections();
		const filter =
			/^[0-9a-f]{24}$/i.test(id) ? { _id: new ObjectId(id) } : { id };
		return orders.findOne(filter as { _id: ObjectId } | { id: string });
	},

	async getOrderByNumber(orderNumber: string) {
		const { orders } = await getCollections();
		return orders.findOne({ orderNumber });
	},

	async createProduct(data: {
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
		const { products, categories, collections } = await getCollections();
		const slug =
			data.slug ||
			data.name
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, "")
				.replace(/\s+/g, "-");

		const existing = await products.findOne({ slug });
		if (existing) throw new Error("Slug already exists");

		const category =
			data.categoryId ?
				await categories.findOne({ _id: new ObjectId(data.categoryId) })
			:	null;
		const collection =
			data.collectionId ?
				await collections.findOne({
					_id: new ObjectId(data.collectionId),
				})
			:	null;

		const count = await products.countDocuments();
		const newImages = (data.images || []).map((url, idx) => ({
			id: `img_${Date.now()}_${idx}`,
			url,
			altText: data.name,
			order: idx,
			isPrimary: idx === 0,
			width: 800,
			height: 1000,
		}));

		const product: Product = {
			_id: new ObjectId(),
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
			order: count + 1,
			categoryId: data.categoryId || null,
			collectionId: data.collectionId || null,
			category: category || null,
			collection: collection || null,
			images: newImages,
			material: data.material || null,
			fit: data.fit || null,
			care: data.care || null,
			sizes: data.sizes || [],
			colors: data.colors || [],
			tags: data.tags || [],
			variants: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		await products.insertOne(product as Product & { _id: ObjectId });
		return product;
	},

	async updateProduct(id: string, data: Partial<Product>) {
		const { products } = await getCollections();
		await products.updateOne(getIdFilter(id) as any, {
			$set: { ...data, updatedAt: new Date() },
		});
		return this.getProductById(id);
	},

	async deleteProduct(id: string) {
		const { products } = await getCollections();
		const result = await products.updateOne(getIdFilter(id) as any, {
			$set: { isArchived: true, isActive: false, updatedAt: new Date() },
		});
		return result.modifiedCount > 0;
	},

	async createCategory(data: {
		name: string;
		slug?: string;
		description?: string;
		imageUrl?: string;
		parentId?: string | null;
		order?: number;
		isActive?: boolean;
	}) {
		const { categories } = await getCollections();
		const slug =
			data.slug ||
			data.name
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, "")
				.replace(/\s+/g, "-");

		const existing = await categories.findOne({ slug });
		if (existing) throw new Error("Slug already exists");

		const count = await categories.countDocuments();
		const category: Category = {
			_id: new ObjectId(),
			id: `cat_${Date.now()}`,
			name: data.name,
			slug,
			description: data.description || null,
			imageUrl: data.imageUrl || null,
			parentId: data.parentId || null,
			order: data.order ?? count + 1,
			isActive: data.isActive ?? true,
		};

		await categories.insertOne(category as Category & { _id: ObjectId });
		return category;
	},

	async createCollection(data: {
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
		const { collections } = await getCollections();
		const slug =
			data.slug ||
			data.name
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, "")
				.replace(/\s+/g, "-");

		const existing = await collections.findOne({ slug });
		if (existing) throw new Error("Slug already exists");

		const count = await collections.countDocuments();
		const collection: CollectionType = {
			_id: new ObjectId(),
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
			order: data.order ?? count + 1,
		};

		await collections.insertOne(
			collection as CollectionType & { _id: ObjectId },
		);
		return collection;
	},

	async createEmailVerification(email: string) {
		const { emailVerifications } = await getCollections();
		const token =
			Math.random().toString(36).substring(2, 15) +
			Math.random().toString(36).substring(2, 15);
		const verification: EmailVerification = {
			_id: new ObjectId(),
			id: `ev_${Date.now()}`,
			email,
			token,
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
			createdAt: new Date(),
		};

		await emailVerifications.insertOne(
			verification as EmailVerification & { _id: ObjectId },
		);
		return verification;
	},

	async verifyEmail(token: string) {
		const { emailVerifications, users } = await getCollections();
		const verification = await emailVerifications.findOne({ token });
		if (!verification) return { success: false, error: "Invalid token" };
		if (verification.expiresAt < new Date())
			return { success: false, error: "Token expired" };

		await users.updateOne(
			{ email: verification.email },
			{ $set: { emailVerified: true } },
		);
		await emailVerifications.deleteOne({ _id: verification._id });

		return { success: true, email: verification.email };
	},

	async getEmailVerification(email: string) {
		const { emailVerifications } = await getCollections();
		return emailVerifications.findOne({ email });
	},

	async createPayment(data: {
		orderId: string;
		method: PaymentMethod;
		senderNumber?: string;
		transactionId?: string;
		amount: number;
	}) {
		const { payments, orders } = await getCollections();

		const payment: Payment = {
			_id: new ObjectId(),
			id: `pay_${Date.now()}`,
			orderId: data.orderId,
			method: data.method,
			senderNumber: data.senderNumber || null,
			transactionId: data.transactionId || null,
			amount: data.amount,
			status: "PENDING" as PaymentStatus,
			adminNotes: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		await payments.insertOne(payment as Payment & { _id: ObjectId });

		const order = await orders.findOne(getIdFilter(data.orderId) as any);
		if (order) {
			const newDue =
				order.subtotal +
				order.shippingCost +
				order.tax -
				order.discount -
				data.amount;
			await orders.updateOne(getIdFilter(data.orderId) as any, {
				$set: {
					status: "PAYMENT_SUBMITTED" as OrderStatus,
					paidAmount: data.amount,
					dueAmount: newDue,
					updatedAt: new Date(),
				},
			});
		}

		return payment;
	},

	async updatePaymentStatus(
		paymentId: string,
		status: PaymentStatus,
		adminNotes?: string,
	) {
		const { payments, orders } = await getCollections();
		await payments.updateOne(getIdFilter(paymentId) as any, {
			$set: {
				status,
				adminNotes: adminNotes || null,
				updatedAt: new Date(),
			},
		});

		const payment = await payments.findOne(getIdFilter(paymentId) as any);
		if (payment) {
			if (status === "APPROVED") {
				await orders.updateOne(getIdFilter(payment.orderId) as any, {
					$set: {
						status: "CONFIRMED" as OrderStatus,
						updatedAt: new Date(),
					},
				});
			} else if (status === "REJECTED") {
				const order = await orders.findOne(
					getIdFilter(payment.orderId) as any,
				);
				await orders.updateOne(getIdFilter(payment.orderId) as any, {
					$set: {
						status: "PENDING" as OrderStatus,
						paidAmount: 0,
						dueAmount:
							order ?
								order.subtotal +
								order.shippingCost +
								order.tax -
								order.discount
							:	0,
						updatedAt: new Date(),
					},
				});
			}
		}

		return payment;
	},

	async getPaymentByOrderId(orderId: string) {
		const { payments } = await getCollections();
		return payments.findOne({ orderId });
	},

	async updateOrderStatus(
		orderId: string,
		status: OrderStatus,
		adminNotes?: string,
	) {
		const { orders } = await getCollections();
		await orders.updateOne(getIdFilter(orderId) as any, {
			$set: {
				status,
				adminNotes: adminNotes || null,
				updatedAt: new Date(),
			},
		});
		return this.getOrderById(orderId);
	},

	async deleteOrder(id: string) {
		const { orders } = await getCollections();
		const result = await orders.deleteOne(getIdFilter(id) as any);
		return result.deletedCount > 0;
	},

	async getMedia(
		options: {
			type?: "IMAGE" | "VIDEO";
			page?: number;
			perPage?: number;
		} = {},
	) {
		const { media } = await getCollections();
		const filter =
			options.type ? { type: options.type as "IMAGE" | "VIDEO" } : {};
		const page = options.page || 1;
		const perPage = options.perPage || 50;
		const skip = (page - 1) * perPage;

		const [items, total] = await Promise.all([
			media
				.find(filter)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(perPage)
				.toArray(),
			media.countDocuments(filter),
		]);

		return {
			items,
			total,
			page,
			perPage,
			totalPages: Math.ceil(total / perPage),
		};
	},

	async createMedia(data: {
		url: string;
		publicId?: string;
		altText?: string;
		type?: "IMAGE" | "VIDEO";
		width?: number;
		height?: number;
		size?: number;
		mimeType?: string;
		folder?: string;
	}) {
		const { media } = await getCollections();
		const item: Media = {
			_id: new ObjectId(),
			id: `media_${Date.now()}`,
			url: data.url,
			publicId: data.publicId || null,
			altText: data.altText || null,
			type: data.type || "IMAGE",
			width: data.width || null,
			height: data.height || null,
			size: data.size || null,
			mimeType: data.mimeType || null,
			folder: data.folder || null,
			createdAt: new Date(),
		};

		await media.insertOne(item as Media & { _id: ObjectId });
		return item;
	},

	async deleteMedia(id: string) {
		const { media } = await getCollections();
		const result = await media.deleteOne(getIdFilter(id) as any);
		return result.deletedCount > 0;
	},
};

export const mongo = mongoMethods;
export const db = mongoMethods;
