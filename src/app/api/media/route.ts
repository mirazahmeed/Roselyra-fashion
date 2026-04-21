import { NextRequest } from "next/server";
import { mongo as db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { requireEditor } from "@/lib/apiMiddleware";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const page = parseInt(searchParams.get("page") ?? "1");
		const perPage = parseInt(searchParams.get("perPage") ?? "50");

		const result = await db.getMedia({ page, perPage });
		return successResponse(result);
	} catch (err) {
		console.error("[MEDIA GET]", err);
		return errorResponse("Internal server error", 500);
	}
}

export async function POST(req: NextRequest) {
	const authError = requireEditor(req);
	if (authError) return authError;

	try {
		const body = await req.json();
		const { url, publicId, altText, type, width, height, size, mimeType, folder } = body;
		const media = await db.createMedia({ url, publicId, altText, type, width, height, size, mimeType, folder });
		return successResponse(media, 201);
	} catch (err) {
		console.error("[MEDIA POST]", err);
		return errorResponse("Internal server error", 500);
	}
}