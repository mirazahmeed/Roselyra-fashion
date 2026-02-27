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
	parentId: z.string().optional().nullable(),
	order: z.number().optional(),
	isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const page = parseInt(searchParams.get("page") ?? "1");
	const perPage = parseInt(searchParams.get("perPage") ?? "50");
	const includeInactive = searchParams.get("includeInactive") === "true";
	
	try {
		const categories = db.getCategories({ includeInactive });
		
		const skip = (page - 1) * perPage;
		const items = categories.slice(skip, skip + perPage);
		
		return successResponse({
			items,
			total: categories.length,
			page,
			perPage,
			totalPages: Math.ceil(categories.length / perPage),
		});
	} catch (err) {
		console.error("[CATEGORIES GET]", err);
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

		const category = db.createCategory(parsed.data);
		return successResponse(category, 201);
	} catch (err) {
		console.error("[CATEGORIES POST]", err);
		if (err instanceof Error) {
			return errorResponse(err.message, 409);
		}
		return errorResponse("Internal server error", 500);
	}
}
