import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import type { JWTPayload } from "@/lib/auth";

export function getTokenFromRequest(req: NextRequest): string | null {
	const authHeader = req.headers.get("authorization");
	if (authHeader?.startsWith("Bearer ")) {
		return authHeader.substring(7);
	}
	const cookie = req.cookies.get("access_token");
	return cookie?.value ?? null;
}

export function authenticate(req: NextRequest): JWTPayload | null {
	const token = getTokenFromRequest(req);
	if (!token) return null;
	try {
		return verifyAccessToken(token);
	} catch {
		return null;
	}
}

export function requireAuth(req: NextRequest): NextResponse | null {
	const user = authenticate(req);
	if (!user) {
		return NextResponse.json(
			{ success: false, error: "Unauthorized" },
			{ status: 401 },
		);
	}
	return null;
}

export function requireAdmin(req: NextRequest): NextResponse | null {
	const user = authenticate(req);
	if (!user) {
		return NextResponse.json(
			{ success: false, error: "Unauthorized" },
			{ status: 401 },
		);
	}
	if (user.role !== "ADMIN") {
		return NextResponse.json(
			{ success: false, error: "Forbidden — Admin access required" },
			{ status: 403 },
		);
	}
	return null;
}

export function requireEditor(req: NextRequest): NextResponse | null {
	const user = authenticate(req);
	if (!user) {
		return NextResponse.json(
			{ success: false, error: "Unauthorized" },
			{ status: 401 },
		);
	}
	if (user.role !== "ADMIN" && user.role !== "EDITOR") {
		return NextResponse.json(
			{ success: false, error: "Forbidden — Editor access required" },
			{ status: 403 },
		);
	}
	return null;
}
