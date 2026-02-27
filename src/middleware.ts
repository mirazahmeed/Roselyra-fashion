import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Using jose instead of jsonwebtoken for Edge runtime compatibility
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// Protect admin routes (except login)
	if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
		const token = req.cookies.get("access_token")?.value;

		if (!token) {
			return NextResponse.redirect(new URL("/admin/login", req.url));
		}

		try {
			const { payload } = await jwtVerify(token, JWT_SECRET);

			// Ensure role is admin or editor
			if (payload.role !== "ADMIN" && payload.role !== "EDITOR") {
				return NextResponse.redirect(new URL("/admin/login", req.url));
			}

			return NextResponse.next();
		} catch (error) {
			// Token invalid or expired
			const response = NextResponse.redirect(
				new URL("/admin/login", req.url),
			);
			response.cookies.delete("access_token");
			return response;
		}
	}

	// If logged in, redirect away from login
	if (pathname === "/admin/login") {
		const token = req.cookies.get("access_token")?.value;
		if (token) {
			try {
				await jwtVerify(token, JWT_SECRET);
				return NextResponse.redirect(new URL("/admin", req.url));
			} catch {
				// invalid token, let them login
			}
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/admin/:path*"],
};
