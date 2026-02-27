"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isEditor } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isEditor() && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [mounted, isEditor, pathname, router]);

  // Don't render until hydration to avoid layout shift on role check
  if (!mounted) return null;

  // Login page doesn't need sidebar wrapper
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Not authorized state (flickering prevention)
  if (!isEditor()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-8 h-8 animate-spin text-noir" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 font-sans text-noir flex">
      <AdminSidebar />
      <main className="pl-64 flex-1 min-h-screen flex flex-col">
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
