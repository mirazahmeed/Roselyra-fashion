import { NextRequest } from "next/server";
import { mongo as db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { requireEditor } from "@/lib/apiMiddleware";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
	try {
		const settings = await db.getSettings();
		return successResponse(settings);
	} catch (err) {
		console.error("[HOME_CONFIG GET]", err);
		return errorResponse("Internal server error", 500);
	}
}

export async function PUT(req: NextRequest) {
	const authError = requireEditor(req);
	if (authError) return authError;

	try {
		const body = await req.json();
		const settings = await db.updateSettings(body);
		revalidatePath("/", "layout");
		return successResponse(settings);
	} catch (err) {
		console.error("[HOME_CONFIG PUT]", err);
		return errorResponse("Internal server error", 500);
	}
}