import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
	_req: NextRequest,
	{ params }: { params: { filename: string } },
) {
	try {
		const filename = params.filename;

		// Prevent path traversal attacks
		if (
			filename.includes("..") ||
			filename.includes("/") ||
			filename.includes("\\")
		) {
			return NextResponse.json(
				{ error: "Invalid filename" },
				{ status: 400 },
			);
		}

		const filepath = join(process.cwd(), "uploads", filename);

		if (!existsSync(filepath)) {
			return NextResponse.json(
				{ error: "File not found" },
				{ status: 404 },
			);
		}

		const buffer = await readFile(filepath);

		// Determine content type from extension
		const ext = filename.split(".").pop()?.toLowerCase() || "";
		const contentTypes: Record<string, string> = {
			jpg: "image/jpeg",
			jpeg: "image/jpeg",
			png: "image/png",
			gif: "image/gif",
			webp: "image/webp",
			svg: "image/svg+xml",
			mp4: "video/mp4",
			webm: "video/webm",
			avif: "image/avif",
		};
		const contentType = contentTypes[ext] || "application/octet-stream";

		return new NextResponse(buffer, {
			status: 200,
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=31536000, immutable",
			},
		});
	} catch (err) {
		console.error("[MEDIA FILE]", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
