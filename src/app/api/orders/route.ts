import { NextRequest } from "next/server";
import { z } from "zod";
import { mongo as db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { authenticate, requireAuth } from "@/lib/apiMiddleware";
import { getDb } from "@/lib/mongodb";

const orderSchema = z.object({
	items: z.array(
		z.object({
			productId: z.string(),
			quantity: z.number().int().min(1),
			price: z.number().positive(),
			size: z.string().optional().nullable(),
			color: z.string().optional().nullable(),
		}),
	),
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	phone: z.string().optional(),
	address: z.string().min(1),
	city: z.string().min(1),
	state: z.string().optional(),
	postalCode: z.string().min(1),
	country: z.string().min(1),
	shippingCost: z.number().default(0),
	discount: z.number().default(0),
	couponCode: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
	try {
		const authError = requireAuth(req);
		if (authError) return authError;

		const user = authenticate(req);
		const body = await req.json();
		const parsed = orderSchema.safeParse(body);
		if (!parsed.success) return errorResponse(parsed.error.message);

		const data = parsed.data;
		let finalDiscount = data.discount || 0;

		const mongoDb = await getDb();

		// Secure Coupon Validation
		if (data.couponCode) {
			const coupons = mongoDb.collection("coupons");
			const coupon = await coupons.findOne({
				code: data.couponCode.toUpperCase(),
				isActive: true,
			});

			if (!coupon) {
				return errorResponse("Invalid or inactive coupon code", 400);
			}

			if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
				return errorResponse("This coupon has expired", 400);
			}

			if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
				return errorResponse("This coupon has already reached its usage limit", 400);
			}

			if (coupon.firstOrderOnly) {
				const ordersCol = mongoDb.collection("orders");
				const previousOrder = await ordersCol.findOne({
					email: data.email,
					status: { $nin: ["CANCELLED", "REFUNDED"] },
				});

				if (previousOrder) {
					return errorResponse("This welcome coupon is only applicable on your first order.", 400);
				}
			}

			// Server-side discount calculation to prevent frontend tampering
			const subtotal = data.items.reduce(
				(sum, item) => sum + item.price * item.quantity,
				0,
			);

			if (coupon.discountPercent) {
				finalDiscount = subtotal * (coupon.discountPercent / 100);
			} else if (coupon.discountAmount) {
				finalDiscount = coupon.discountAmount;
			}

			// Increment coupon usage
			await coupons.updateOne(
				{ _id: coupon._id },
				{ $inc: { usedCount: 1 } }
			);
		}

		const order = await db.createOrder({
			...data,
			discount: finalDiscount,
			userId: user?.userId,
		});

		return successResponse(order, 201);
	} catch (err) {
		console.error("[ORDERS POST]", err);
		return errorResponse("Internal server error", 500);
	}
}


export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const page = parseInt(searchParams.get("page") ?? "1");
		const perPage = parseInt(searchParams.get("perPage") ?? "20");
		const orderNumber = searchParams.get("orderNumber");
		const myOrders = searchParams.get("myOrders");

		if (orderNumber) {
			const allOrders = await db.getOrders({ perPage: 1000 });
			const order = allOrders.items.find(o => o.orderNumber === orderNumber);
			if (!order) return errorResponse("Order not found", 404);
			return successResponse(order);
		}

		if (myOrders === "true") {
			const authError = requireAuth(req);
			if (authError) return authError;

			const user = authenticate(req);
			const result = await db.getOrders({ userId: user?.userId, page, perPage });
			
			const ordersWithPayment = await Promise.all(result.items.map(async (order: any) => {
				const payment = await db.getPaymentByOrderId(order.id);
				return {
					...order,
					paymentStatus: payment ? payment.status : "UNPAID",
				};
			}));
			
			return successResponse({ ...result, items: ordersWithPayment });
		}

		const result = await db.getOrders({ page, perPage });
		return successResponse(result);
	} catch (err) {
		console.error("[ORDERS GET]", err);
		return errorResponse("Internal server error", 500);
	}
}