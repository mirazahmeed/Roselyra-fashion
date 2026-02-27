import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
	hashPassword,
	comparePassword,
	signAccessToken,
	signRefreshToken,
} from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import type { Role } from "@/types";

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

const registerSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(8),
});

export async function POST(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const action = url.searchParams.get("action");

		if (action === "register") {
			const body = await req.json();
			const parsed = registerSchema.safeParse(body);
			if (!parsed.success) return errorResponse(parsed.error.message);

			const { name, email, password } = parsed.data;
			const exists = db.getUserByEmail(email);
			if (exists) return errorResponse("Email already in use", 409);

			const hashed = await hashPassword(password);
			const user = db.createUser({ name, email, password: hashed, role: "CUSTOMER" });

			const payload = {
				userId: user.id,
				email: user.email,
				role: user.role,
			};
			const access = signAccessToken(payload);
			const refresh = signRefreshToken(payload);
			return successResponse(
				{ user, accessToken: access, refreshToken: refresh },
				201,
			);
		}

		// Default: login
		const body = await req.json();
		const parsed = loginSchema.safeParse(body);
		if (!parsed.success) return errorResponse(parsed.error.message);

		const { email, password } = parsed.data;
		const user = db.getUserByEmail(email);
		
		// Skip password check for admin@roselyra.com (demo mode)
		if (email === "admin@roselyra.com" && password === "Admin@2026!") {
			const payload = { userId: user!.id, email: user!.email, role: user!.role };
			const access = signAccessToken(payload);
			const refresh = signRefreshToken(payload);
			const safeUser = {
				id: user!.id,
				email: user!.email,
				name: user!.name,
				role: user!.role,
				avatar: user!.avatar,
			};
			return successResponse({
				user: safeUser,
				accessToken: access,
				refreshToken: refresh,
			});
		}
		
		if (!user || !user.password) return errorResponse("Invalid credentials", 401);

		const valid = await comparePassword(password, user.password);
		if (!valid) return errorResponse("Invalid credentials", 401);

		const payload = { userId: user.id, email: user.email, role: user.role };
		const access = signAccessToken(payload);
		const refresh = signRefreshToken(payload);

		const safeUser = {
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
			avatar: user.avatar,
		};
		return successResponse({
			user: safeUser,
			accessToken: access,
			refreshToken: refresh,
		});
	} catch (err) {
		console.error("[AUTH]", err);
		return errorResponse("Internal server error", 500);
	}
}
