import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { mongo as db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { requireEditor } from "@/lib/apiMiddleware";

export async function POST(req: NextRequest) {
	const authError = requireEditor(req);
	if (authError) return authError;

	try {
		const formData = await req.formData();
		const file = formData.get("file") as File | null;

		if (!file) {
			return errorResponse("No file provided", 400);
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

		const uploadDir = join(process.cwd(), "uploads");

		try {
			await mkdir(uploadDir, { recursive: true });
		} catch {}

		const filepath = join(uploadDir, filename);
		await writeFile(filepath, buffer);

		const url = `/api/media/file/${filename}`;
		const mimeType = file.type || "application/octet-stream";
		const type: "VIDEO" | "IMAGE" = mimeType.startsWith("video") ? "VIDEO" : "IMAGE";

		const media = await db.createMedia({
			url,
			altText: file.name,
			type,
			size: file.size,
			mimeType,
		});
		return successResponse(media, 201);
	} catch (err) {
		console.error("[MEDIA UPLOAD]", err);
		return errorResponse("Failed to upload file", 500);
	}
}