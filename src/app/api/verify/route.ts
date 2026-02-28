import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return errorResponse("Email is required", 400);
    }

    const user = db.users.find(u => u.email === email);
    
    if (!user) {
      return errorResponse("User not found", 404);
    }

    if (user.emailVerified) {
      return errorResponse("Email already verified", 400);
    }

    // Create verification token
    const verification = db.createEmailVerification(email);

    // Send verification email
    try {
      const { sendVerificationEmail } = await import("@/lib/email");
      await sendVerificationEmail(email, verification.token);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue even if email fails
    }

    return successResponse({ message: "Verification email sent" });
  } catch (err) {
    console.error("[VERIFY_EMAIL]", err);
    return errorResponse("Internal server error", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return errorResponse("Token is required", 400);
    }

    const result = db.verifyEmail(token);

    if (!result.success) {
      return errorResponse(result.error || "Verification failed", 400);
    }

    // Redirect to login with success message
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/login?verified=true",
      },
    });
  } catch (err) {
    console.error("[VERIFY_EMAIL_GET]", err);
    return errorResponse("Internal server error", 500);
  }
}
