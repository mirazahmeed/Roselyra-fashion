import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { requireEditor } from "@/lib/apiMiddleware";

const updateSchema = z.object({
	name: z.string().min(1).optional(),
	slug: z.string().optional(),
	description: z.string().optional(),
	imageUrl: z.string().optional(),
	videoUrl: z.string().optional(),
	season: z.string().optional(),
	year: z.number().optional(),
	isFeatured: z.boolean().optional(),
	isActive: z.boolean().optional(),
	order: z.number().optional(),
});

export async function GET(
	_req: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		let collection = db.getCollectionBySlug(params.id);
		if (!collection) {
			const allCollections = db.getCollections({ includeInactive: true });
			collection = allCollections.find(c => c.id === params.id) || null;
		}
		if (!collection) return errorResponse("Collection not found", 404);

		const products = db.getProducts({ collection: collection.slug, perPage: 50 }).items;
		
		return successResponse({ ...collection, products });
	} catch (err) {
		console.error("[COLLECTION GET]", err);
		return errorResponse("Internal server error", 500);
	}
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	const authError = requireEditor(req);
	if (authError) return authError;

	try {
		const allCollections = db.getCollections({ includeInactive: true });
		const collection = allCollections.find(c => c.id === params.id);
		if (!collection) return errorResponse("Collection not found", 404);

		return successResponse(collection);
	} catch (err) {
		console.error("[COLLECTION PUT]", err);
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
		return successResponse({ deleted: true });
	} catch (err) {
		console.error("[COLLECTION DELETE]", err);
		return errorResponse("Internal server error", 500);
	}
}
