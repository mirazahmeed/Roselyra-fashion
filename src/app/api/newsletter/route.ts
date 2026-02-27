import { NextRequest } from "next/server";
import { z } from "zod";
import { successResponse, errorResponse } from "@/lib/apiHelpers";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const parsed = schema.safeParse(body);
		if (!parsed.success) return errorResponse("Invalid email");
		// TODO: integrate with Mailchimp/Klaviyo
		console.log("[NEWSLETTER] New subscriber:", parsed.data.email);
		return successResponse({ subscribed: true });
	} catch (err) {
		console.error("[NEWSLETTER POST]", err);
		return errorResponse("Internal server error", 500);
	}
}
