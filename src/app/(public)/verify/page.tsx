"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/verify?token=${token}`);
        const data = await res.json();
        
        if (data.success) {
          setStatus("success");
          setMessage("Email verified successfully!");
          setTimeout(() => router.push("/login?verified=true"), 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-noir mx-auto mb-4" />
            <p className="text-lg">Verifying your email...</p>
          </>
        )}
        
        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg text-green-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
          </>
        )}
        
        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg text-red-600">{message}</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 text-sm underline"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
