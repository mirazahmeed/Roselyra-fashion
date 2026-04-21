import { NextRequest } from "next/server";
import { z } from "zod";
import { mongo as db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { authenticate, requireAuth } from "@/lib/apiMiddleware";

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
		const order = await db.createOrder({ ...data, userId: user?.userId });

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