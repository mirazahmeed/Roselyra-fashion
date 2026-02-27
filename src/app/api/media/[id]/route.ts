import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { requireEditor } from "@/lib/apiMiddleware";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const media = db.media.find((m) => m.id === params.id);

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

		const index = db.media.findIndex((m) => m.id === params.id);
		if (index === -1) return errorResponse("Media not found", 404);

		if (altText !== undefined) db.media[index].altText = altText;
		if (folder !== undefined) db.media[index].folder = folder;

		db.saveDB();
		return successResponse(db.media[index]);
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
		const index = db.media.findIndex((m) => m.id === params.id);
		if (index === -1) return errorResponse("Media not found", 404);

		db.media.splice(index, 1);
		db.saveDB();
		return successResponse({ deleted: true });
	} catch (err) {
		console.error("[MEDIA DELETE]", err);
		return errorResponse("Internal server error", 500);
	}
}
