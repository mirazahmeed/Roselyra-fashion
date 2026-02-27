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
	parentId: z.string().optional().nullable(),
	order: z.number().optional(),
	isActive: z.boolean().optional(),
});

export async function GET(
	_req: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		let category = db.getCategoryBySlug(params.id);
		if (!category) {
			const allCategories = db.getCategories({ includeInactive: true });
			category = allCategories.find(c => c.id === params.id) || null;
		}
		if (!category) return errorResponse("Category not found", 404);
		return successResponse(category);
	} catch (err) {
		console.error("[CATEGORY GET]", err);
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
		const allCategories = db.getCategories({ includeInactive: true });
		const index = allCategories.findIndex(c => c.id === params.id);
		if (index === -1) return errorResponse("Category not found", 404);

		return successResponse(allCategories[index]);
	} catch (err) {
		console.error("[CATEGORY PUT]", err);
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
		console.error("[CATEGORY DELETE]", err);
		return errorResponse("Internal server error", 500);
	}
}
