"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Login failed");
      }

      if (json.data.user.role !== "ADMIN" && json.data.user.role !== "EDITOR") {
        throw new Error("Unauthorized access. Admin or Editor role required.");
      }

      setUser(json.data.user);
      setAccessToken(json.data.accessToken);
      
      // Store token in cookie for middleware
      document.cookie = `access_token=${json.data.accessToken}; path=/; max-age=604800; samesite=lax`;

      toast.success(`Welcome back, ${json.data.user.name || "Admin"}`);
      router.push("/admin");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md p-8 bg-card border border-noir/10 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display uppercase tracking-widest mb-2">
            Roselyra
          </h1>
          <p className="text-sm uppercase tracking-widest text-muted">
            Admin Portal Access
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-widest">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@roselyra.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs uppercase tracking-widest">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="luxury"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Authenticating..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
