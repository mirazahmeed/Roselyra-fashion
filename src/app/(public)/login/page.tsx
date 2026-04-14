"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { setUser, setAccessToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const [formData, setFormData] = useState<CustomerData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const customerData: CustomerData = {
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
        phone: user.phoneNumber || undefined,
      };

      const idToken = await user.getIdToken();
      
      const res = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "google",
          uid: user.uid,
          email: customerData.email,
          name: user.displayName,
          avatar: user.photoURL,
          idToken,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setUser({
          id: data.data.id,
          email: customerData.email,
          name: `${customerData.firstName} ${customerData.lastName}`,
          role: "CUSTOMER",
          avatar: user.photoURL,
        });
        setAccessToken(data.data.accessToken);
        toast.success("Welcome back!");
        router.push(redirect);
      } else {
        toast.error(data.error || "Authentication failed");
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, password);
      const user = userCredential.user;

      if (user) {
        await updateProfile(user, {
          displayName: `${formData.firstName} ${formData.lastName}`,
        });

        const idToken = await user.getIdToken();

        const res = await fetch("/api/auth/firebase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "signup",
            uid: user.uid,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            idToken,
          }),
        });

        const data = await res.json();

        if (data.success) {
          setUser({
            id: data.data.id,
            email: formData.email,
            name: `${formData.firstName} ${formData.lastName}`,
            role: "CUSTOMER",
            avatar: null,
          });
          setAccessToken(data.data.accessToken);
          toast.success("Account created successfully!");
          router.push(redirect);
        } else {
          toast.error(data.error || "Failed to create account");
        }
      }
    } catch (error: any) {
      console.error("Email sign-up error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already registered");
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      const res = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          uid: user.uid,
          idToken,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setUser({
          id: data.data.id,
          email: user.email || "",
          name: user.displayName || "",
          role: "CUSTOMER",
          avatar: user.photoURL,
        });
        setAccessToken(data.data.accessToken);
        toast.success("Welcome back!");
        router.push(redirect);
      } else {
        toast.error(data.error || "Authentication failed");
      }
    } catch (error: any) {
      console.error("Email sign-in error:", error);
      if (error.code === "auth/invalid-credential") {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.message || "Failed to sign in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Please enter your email");
      return;
    }
    setShowDetails(true);
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-display tracking-widest uppercase">
            Roselyra
          </Link>
          <p className="text-sm text-gray-500 mt-2">
            {isSignUp ? "Create your account" : "Welcome back"}
          </p>
        </div>

        <div className="bg-white p-8 shadow-lg">
          {!showDetails && !isSignUp ? (
            <form onSubmit={handleContinue} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12"
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-noir text-cream hover:bg-noir/90">
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={isSignUp ? handleEmailSignUp : handleEmailSignIn} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      className="h-12"
                    />
                    <Input
                      type="text"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                  <Input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12"
                  />
                </>
              )}
              
              {(!isSignUp || showDetails) && (
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12"
                />
              )}
              
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />

              {isSignUp && (
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12"
                />
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-noir text-cream hover:bg-noir/90"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                  isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <p className="text-center mt-6 text-sm text-gray-600">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setShowDetails(false); }}
                  className="text-noir font-medium hover:underline"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setShowDetails(false); }}
                  className="text-noir font-medium hover:underline"
                >
                  Sign Up
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-display tracking-widest uppercase">
            Roselyra
          </Link>
          <p className="text-sm text-gray-500 mt-2">Loading...</p>
        </div>
        <div className="bg-white p-8 shadow-lg flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-noir" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
