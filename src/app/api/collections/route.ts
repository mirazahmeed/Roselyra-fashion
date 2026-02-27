import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { requireEditor } from "@/lib/apiMiddleware";

const schema = z.object({
	name: z.string().min(1),
	slug: z.string().optional(),
	description: z.string().optional(),
	imageUrl: z.string().optional(),
	videoUrl: z.string().optional(),
	season: z.string().optional(),
	year: z.number().optional(),
	isFeatured: z.boolean().default(false),
	isActive: z.boolean().default(true),
	order: z.number().optional(),
});

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const featured = searchParams.get("featured");
	const includeInactive = searchParams.get("includeInactive") === "true";
	
	try {
		const collections = db.getCollections({
			featured: featured === "true",
			includeInactive,
		});
		
		const collectionsWithProducts = collections.map(col => ({
			...col,
			products: db.getProducts({ collection: col.slug, perPage: 6 }).items.slice(0, 6).map(p => ({
				...p,
				images: p.images.slice(0, 1),
			})),
		}));
		
		return successResponse({
			items: collectionsWithProducts,
			total: collections.length,
		});
	} catch (err) {
		console.error("[COLLECTIONS GET]", err);
		return errorResponse("Internal server error", 500);
	}
}

export async function POST(req: NextRequest) {
	const authError = requireEditor(req);
	if (authError) return authError;

	try {
		const body = await req.json();
		const parsed = schema.safeParse(body);
		if (!parsed.success) return errorResponse(parsed.error.message);

		const collection = db.createCollection(parsed.data);
		return successResponse(collection, 201);
	} catch (err) {
		console.error("[COLLECTIONS POST]", err);
		if (err instanceof Error) {
			return errorResponse(err.message, 409);
		}
		return errorResponse("Internal server error", 500);
	}
}
