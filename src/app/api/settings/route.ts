import { NextRequest } from "next/server";
import { mongo as db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { requireEditor } from "@/lib/apiMiddleware";

export async function GET(req: NextRequest) {
  try {
    const settings = await db.getSettings();
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
    const settings = await db.updateSettings(body);
    return successResponse(settings);
  } catch (err) {
    console.error("[SETTINGS_PUT]", err);
    return errorResponse("Internal server error", 500);
  }
}