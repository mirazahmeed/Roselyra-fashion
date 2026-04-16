import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { requireEditor } from "@/lib/apiMiddleware";
import { revalidatePath } from "next/cache";

export async function GET(
	_req: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		let product = db.getProductById(params.id);
		if (!product) {
			product = db.getProductBySlug(params.id);
		}
		if (!product) return errorResponse("Product not found", 404);
		return successResponse(product);
	} catch (err) {
		console.error("[PRODUCT GET]", err);
		return errorResponse("Internal server error", 500);
	}
}

const updateSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	longDesc: z.string().optional(),
	price: z.number().positive().optional(),
	comparePrice: z.number().optional().nullable(),
	sku: z.string().optional(),
	stock: z.number().int().min(0).optional(),
	isFeatured: z.boolean().optional(),
	isArchived: z.boolean().optional(),
	isActive: z.boolean().optional(),
	order: z.number().optional(),
	categoryId: z.string().optional().nullable(),
	collectionId: z.string().optional().nullable(),
	material: z.string().optional(),
	fit: z.string().optional(),
	care: z.string().optional(),
	sizes: z.array(z.string()).optional(),
	colors: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional(),
	images: z.array(z.string()).optional(),
});

export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	const authError = requireEditor(req);
	if (authError) return authError;

	try {
		const body = await req.json();
		const parsed = updateSchema.safeParse(body);
		if (!parsed.success) return errorResponse(parsed.error.message);

		const { images: imageUrls, ...rest } = parsed.data;

		// Convert URL strings → ProductImage objects if images were provided
		const productImages =
			imageUrls ?
				imageUrls.map((url, idx) => ({
					id: `img_${Date.now()}_${idx}`,
					url,
					altText: null,
					order: idx,
					isPrimary: idx === 0,
					width: 800,
					height: 1000,
				}))
			:	undefined;

		const product = db.updateProduct(params.id, {
			...rest,
			...(productImages !== undefined ? { images: productImages } : {}),
		});
		if (!product) return errorResponse("Product not found", 404);

		revalidatePath("/", "layout");
		return successResponse(product);
	} catch (err) {
		console.error("[PRODUCT PUT]", err);
		return errorResponse("Internal server error", 500);
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	const authError = requireEditor(req);
	if (authError) return authError;

	try {
		const deleted = db.deleteProduct(params.id);
		if (!deleted) return errorResponse("Product not found", 404);

		revalidatePath("/", "layout");
		return successResponse({ deleted: true });
	} catch (err) {
		console.error("[PRODUCT DELETE]", err);
		return errorResponse("Internal server error", 500);
	}
}
