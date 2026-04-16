import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { requireEditor } from "@/lib/apiMiddleware";
import { revalidatePath } from "next/cache";

const productSchema = z.object({
	name: z.string().min(1),
	slug: z.string().optional(),
	description: z.string().optional(),
	longDesc: z.string().optional(),
	price: z.number().positive(),
	comparePrice: z.number().optional(),
	sku: z.string().optional(),
	stock: z.number().int().min(0).default(0),
	isFeatured: z.boolean().default(false),
	categoryId: z.string().optional(),
	collectionId: z.string().optional(),
	material: z.string().optional(),
	fit: z.string().optional(),
	care: z.string().optional(),
	sizes: z.array(z.string()).default([]),
	colors: z.array(z.string()).default([]),
	tags: z.array(z.string()).default([]),
	images: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const page = parseInt(searchParams.get("page") ?? "1");
		const perPage = parseInt(searchParams.get("perPage") ?? "24");
		const category = searchParams.get("category");
		const collection = searchParams.get("collection");
		const featured = searchParams.get("featured");
		const search = searchParams.get("search");
		const sort = searchParams.get("sort") ?? "order";
		const minPrice = searchParams.get("minPrice");
		const maxPrice = searchParams.get("maxPrice");

		const result = db.getProducts({
			page,
			perPage,
			category: category || undefined,
			collection: collection || undefined,
			featured: featured === "true",
			search: search || undefined,
			sort,
			minPrice: minPrice ? parseFloat(minPrice) : undefined,
			maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
		});

		return successResponse(result);
	} catch (err) {
		console.error("[PRODUCTS GET]", err);
		return errorResponse("Internal server error", 500);
	}
}

export async function POST(req: NextRequest) {
	const authError = requireEditor(req);
	if (authError) return authError;

	try {
		const body = await req.json();
		const parsed = productSchema.safeParse(body);
		if (!parsed.success) return errorResponse(parsed.error.message);

		const data = parsed.data;
		const product = db.createProduct(data);
		revalidatePath("/", "layout");
		return successResponse(product, 201);
	} catch (err) {
		console.error("[PRODUCTS POST]", err);
		if (err instanceof Error) {
			return errorResponse(err.message, 409);
		}
		return errorResponse("Internal server error", 500);
	}
}
