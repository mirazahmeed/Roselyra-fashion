import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export function successResponse<T>(data: T, status = 200): NextResponse {
	const body: ApiResponse<T> = { success: true, data };
	return NextResponse.json(body, { status });
}

export function errorResponse(error: string, status = 400): NextResponse {
	const body: ApiResponse = { success: false, error };
	return NextResponse.json(body, { status });
}

export function generateOrderNumber(): string {
	const timestamp = Date.now().toString(36).toUpperCase();
	const random = Math.random().toString(36).substring(2, 6).toUpperCase();
	return `RL-${timestamp}-${random}`;
}

export function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}

export function paginate(page: number, perPage: number) {
	const take = perPage;
	const skip = (page - 1) * perPage;
	return { take, skip };
}
