import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { requireEditor } from "@/lib/apiMiddleware";

export async function GET(req: NextRequest) {
  try {
    const settings = db.getSettings();
    return successResponse(settings);
  } catch (err) {
    console.error("[SETTINGS_GET]", err);
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  const authError = requireEditor(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const settings = db.updateSettings(body);
    return successResponse(settings);
  } catch (err) {
    console.error("[SETTINGS_PUT]", err);
    return errorResponse("Internal server error", 500);
  }
}
