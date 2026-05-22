import { NextRequest } from "next/server";
import { z } from "zod";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { getDb } from "@/lib/mongodb";

const schema = z.object({
	code: z.string().min(1),
	email: z.string().email().optional(),
});

/** POST — Validate and apply a coupon code */
export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const parsed = schema.safeParse(body);
		if (!parsed.success)
			return errorResponse("Invalid coupon code", 400);

		const db = await getDb();
		const coupons = db.collection("coupons");

		const coupon = await coupons.findOne({
			code: parsed.data.code.toUpperCase(),
			isActive: true,
		});

		if (!coupon) {
			return errorResponse("Invalid or expired coupon code", 400);
		}

		// Check expiration
		if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
			return errorResponse("This coupon has expired", 400);
		}

		// Check usage limit
		if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
			return errorResponse("This coupon has already been used", 400);
		}

		// For first-order-only coupons, check if email has any previous orders
		if (coupon.firstOrderOnly && parsed.data.email) {
			const orders = db.collection("orders");
			const previousOrder = await orders.findOne({
				email: parsed.data.email,
				status: { $nin: ["CANCELLED", "REFUNDED"] },
			});

			if (previousOrder) {
				return errorResponse(
					"This coupon is valid for first orders only",
					400,
				);
			}
		}

		return successResponse({
			code: coupon.code,
			discountPercent: coupon.discountPercent || 0,
			discountAmount: coupon.discountAmount || 0,
			type: coupon.type,
			firstOrderOnly: coupon.firstOrderOnly || false,
		});
	} catch (err) {
		console.error("[COUPONS/VALIDATE POST]", err);
		return errorResponse("Internal server error", 500);
	}
}
