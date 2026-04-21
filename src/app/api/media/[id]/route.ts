import { NextRequest } from "next/server";
import { mongo as db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { requireEditor } from "@/lib/apiMiddleware";

export async function GET(
	_req: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const allMedia = (await db.getMedia({ perPage: 1000 })).items;
		const media = allMedia.find((m) => m.id === params.id);

		if (!media) {
			return errorResponse("Media not found", 404);
		}

		return successResponse(media);
	} catch (err) {
		console.error("[MEDIA GET]", err);
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
		const body = await req.json();
		const { altText, folder } = body;

		const allMedia = (await db.getMedia({ perPage: 1000 })).items;
		const index = allMedia.findIndex((m) => m.id === params.id);
		if (index === -1) return errorResponse("Media not found", 404);

		return successResponse(allMedia[index]);
	} catch (err) {
		console.error("[MEDIA PUT]", err);
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
		const deleted = await db.deleteMedia(params.id);
		if (!deleted) return errorResponse("Media not found", 404);

		return successResponse({ deleted: true });
	} catch (err) {
		console.error("[MEDIA DELETE]", err);
		return errorResponse("Internal server error", 500);
	}
}