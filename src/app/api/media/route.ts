import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { requireEditor } from "@/lib/apiMiddleware";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const page = parseInt(searchParams.get("page") ?? "1");
		const perPage = parseInt(searchParams.get("perPage") ?? "50");

		const allMedia = db.media;
		const skip = (page - 1) * perPage;
		const items = allMedia.slice(skip, skip + perPage);

		return successResponse({
			items,
			total: allMedia.length,
			page,
			perPage,
			totalPages: Math.ceil(allMedia.length / perPage),
		});
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
		const { url, altText, folder } = body;

		if (!url) {
			return errorResponse("URL is required", 400);
		}

		const media = {
			id: `media_${Date.now()}`,
			url,
			altText: altText || null,
			publicId: null,
			type: "IMAGE" as const,
			width: null,
			height: null,
			size: null,
			mimeType: null,
			folder: folder || null,
			createdAt: new Date(),
		};

		db.media.push(media);
		db.saveDB();
		return successResponse(media, 201);
	} catch (err) {
		console.error("[MEDIA POST]", err);
		return errorResponse("Internal server error", 500);
	}
}
