import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { authenticate } from "@/lib/apiMiddleware";

const updateSchema = z.object({
	status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
});

export async function PATCH(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const user = authenticate(req);
		if (!user || user.role !== "ADMIN") {
			return errorResponse("Unauthorized", 401);
		}

		const body = await req.json();
		const parsed = updateSchema.safeParse(body);
		if (!parsed.success) return errorResponse(parsed.error.message);

		const order = db.getOrderById(params.id);
		if (!order) return errorResponse("Order not found", 404);

		return successResponse(order);
	} catch (err) {
		console.error("[ORDER PATCH]", err);
		return errorResponse("Internal server error", 500);
	}
}

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const order = db.getOrderById(params.id);
		if (!order) return errorResponse("Order not found", 404);
		return successResponse(order);
	} catch (err) {
		console.error("[ORDER GET]", err);
		return errorResponse("Internal server error", 500);
	}
}
