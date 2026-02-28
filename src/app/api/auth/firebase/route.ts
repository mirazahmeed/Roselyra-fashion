import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiHelpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "google") {
      const { uid, email, name, avatar } = body;

      if (!email) {
        return errorResponse("Email is required", 400);
      }

      let user = db.getUserByEmail(email);

      if (!user) {
        user = db.createUser({
          name: name || email.split("@")[0],
          email,
          password: "", 
          role: "CUSTOMER",
          avatar: avatar || null,
        });
      }

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
    }

    if (action === "signup") {
      const { uid, firstName, lastName, email, phone } = body;

      if (!email || !firstName || !lastName) {
        return errorResponse("First name, last name, and email are required", 400);
      }

      let user = db.getUserByEmail(email);

      if (user) {
        return errorResponse("Email already registered", 409);
      }

      user = db.createUser({
        name: `${firstName} ${lastName}`,
        email,
        password: "",
        role: "CUSTOMER",
        avatar: undefined,
      });

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
      }, 201);
    }

    if (action === "login") {
      const { email } = body;

      if (!email) {
        return errorResponse("Email is required", 400);
      }

      let user = db.getUserByEmail(email);

      if (!user) {
        return errorResponse("No account found with this email", 401);
      }

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
    }

    return errorResponse("Invalid action", 400);
  } catch (err) {
    console.error("[FIREBASE_AUTH]", err);
    return errorResponse("Internal server error", 500);
  }
}
