import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { requireEditor } from "@/lib/apiMiddleware";

export async function GET(req: NextRequest) {
	try {
		return successResponse(db.homeConfig);
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

		// Update the homeConfig in memory and persist
		Object.assign(db.homeConfig, body);
		db.saveDB();

		return successResponse(db.homeConfig);
	} catch (err) {
		console.error("[HOME_CONFIG PUT]", err);
		return errorResponse("Internal server error", 500);
	}
}
