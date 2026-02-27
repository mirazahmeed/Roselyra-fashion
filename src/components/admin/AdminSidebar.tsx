"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  FolderTree, 
  Image as ImageIcon, 
  Settings, 
  LogOut,
  ShoppingBag,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/home", label: "Home Page", icon: Home },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/collections", label: "Collections", icon: FolderTree },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/media", label: "Media Library", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/admin/login";
  };

  return (
    <aside className="w-64 bg-card border-r flex flex-col h-screen fixed top-0 left-0">
      <div className="p-6 border-b">
        <Link href="/" className="text-xl font-display tracking-widest uppercase block mb-1">
          Roselyra
        </Link>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
          Admin Portal
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {ADMIN_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "admin-link",
                isActive && "active"
              )}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-noir text-cream flex items-center justify-center text-xs font-bold uppercase">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || "A"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="admin-link w-full text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
