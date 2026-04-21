import { NextRequest } from "next/server";
import { mongo as db } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { User } from "@/types";

function toUser(u: User | null): User | null {
	if (!u) return null;
	return {
		_id: u._id,
		id: u.id,
		email: u.email,
		name: u.name,
		role: u.role,
		avatar: u.avatar,
		emailVerified: u.emailVerified,
		createdAt: u.createdAt,
	};
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { action } = body;

		if (action === "google") {
			const { uid, email, name, avatar } = body;

			if (!email) {
				return errorResponse("Email is required", 400);
			}

			let existingUser = await db.getUserByEmail(email);
			let user = toUser(existingUser);

			if (!user) {
				const newUser = await db.createUser({
					name: name || email.split("@")[0],
					email,
					password: "",
					role: "CUSTOMER",
					avatar: avatar || null,
				});
				user = toUser(newUser);
			}

			const payload = { userId: user!.id, email: user!.email, role: user!.role };
			const access = signAccessToken(payload);
			const refresh = signRefreshToken(payload);

			return successResponse({
				user: {
					id: user!.id,
					email: user!.email,
					name: user!.name,
					role: user!.role,
					avatar: user!.avatar,
				},
				accessToken: access,
				refreshToken: refresh,
			});
		}

		if (action === "signup") {
			const { firstName, lastName, email } = body;

			if (!email || !firstName || !lastName) {
				return errorResponse("First name, last name, and email are required", 400);
			}

			const existingUser = await db.getUserByEmail(email);

			if (existingUser) {
				return errorResponse("Email already registered", 409);
			}

			const user = await db.createUser({
				name: `${firstName} ${lastName}`,
				email,
				password: "",
				role: "CUSTOMER",
			});

			const payload = { userId: user.id, email: user.email, role: user.role };
			const access = signAccessToken(payload);
			const refresh = signRefreshToken(payload);

			return successResponse({
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
					avatar: user.avatar,
				},
				accessToken: access,
				refreshToken: refresh,
			}, 201);
		}

		if (action === "login") {
			const { email } = body;

			if (!email) {
				return errorResponse("Email is required", 400);
			}

			const existingUser = await db.getUserByEmail(email);
			const user = toUser(existingUser);

			if (!user) {
				return errorResponse("No account found with this email", 401);
			}

			const payload = { userId: user.id, email: user.email, role: user.role };
			const access = signAccessToken(payload);
			const refresh = signRefreshToken(payload);

			return successResponse({
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
					avatar: user.avatar,
				},
				accessToken: access,
				refreshToken: refresh,
			});
		}

		return errorResponse("Invalid action", 400);
	} catch (err) {
		console.error("[FIREBASE_AUTH]", err);
		return errorResponse("Internal server error", 500);
	}
}