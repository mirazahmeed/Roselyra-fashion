import { NextRequest } from "next/server";
import { z } from "zod";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { getDb } from "@/lib/mongodb";

const schema = z.object({
	email: z.string().email(),
});

function generateCouponCode(): string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let code = "WELCOME";
	for (let i = 0; i < 6; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return code;
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const parsed = schema.safeParse(body);
		if (!parsed.success) return errorResponse("Invalid email", 400);

		const db = await getDb();
		const coupons = db.collection("coupons");

		// Check if user already has a welcome coupon
		const existing = await coupons.findOne({
			email: parsed.data.email,
			type: "WELCOME",
		});

		if (existing) {
			// Return their existing coupon
			return successResponse({
				code: existing.code,
				discountPercent: existing.discountPercent,
				alreadyExists: true,
			});
		}

		// Generate new coupon
		const code = generateCouponCode();
		const coupon = {
			code,
			email: parsed.data.email,
			type: "WELCOME" as const,
			discountPercent: 10,
			maxUses: 1,
			usedCount: 0,
			isActive: true,
			firstOrderOnly: true,
			createdAt: new Date(),
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
		};

		await coupons.insertOne(coupon);

		return successResponse({
			code: coupon.code,
			discountPercent: coupon.discountPercent,
			expiresAt: coupon.expiresAt,
		});
	} catch (err) {
		console.error("[COUPONS/WELCOME POST]", err);
		return errorResponse("Internal server error", 500);
	}
}
