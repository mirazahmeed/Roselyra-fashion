import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET =
	process.env.JWT_SECRET ||
	(() => {
		console.error(
			"[AUTH] WARNING: JWT_SECRET is not set! Using fallback (insecure).",
		);
		return "roselyra-fallback-secret-CHANGE-ME";
	})();

const JWT_REFRESH_SECRET =
	process.env.JWT_REFRESH_SECRET ||
	(() => {
		console.error(
			"[AUTH] WARNING: JWT_REFRESH_SECRET is not set! Using fallback (insecure).",
		);
		return "roselyra-fallback-refresh-CHANGE-ME";
	})();

export interface JWTPayload {
	userId: string;
	email: string;
	role: string;
}

export function signAccessToken(payload: JWTPayload): string {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(payload: JWTPayload): string {
	return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): JWTPayload {
	return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
	return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
}

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12);
}

export async function comparePassword(
	password: string,
	hash: string,
): Promise<boolean> {
	return bcrypt.compare(password, hash);
}
