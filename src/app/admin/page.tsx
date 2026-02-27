"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingBag, Tags, FolderTree, DollarSign, TrendingUp, Loader2 } from "lucide-react";

import { Product, Order, Category, Collection } from "@/types";
import Link from "next/link";
import Image from "next/image";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
  totalCollections: number;
  recentOrders: Order[];
  recentProducts: Product[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsRes, ordersRes, categoriesRes, collectionsRes] = await Promise.all([
          fetch("/api/products?perPage=5&sort=newest"),
          fetch("/api/orders?perPage=5"),
          fetch("/api/categories"),
          fetch("/api/collections"),
        ]);

        const [productsJson, ordersJson, categoriesJson, collectionsJson] = await Promise.all([
          productsRes.json(),
          ordersRes.json(),
          categoriesRes.json(),
          collectionsRes.json(),
        ]);

        setStats({
          totalProducts: productsJson.success ? productsJson.data.total : 0,
          totalOrders: ordersJson.success ? ordersJson.data.total : 0,
          totalCategories: categoriesJson.success ? categoriesJson.data.total : 0,
          totalCollections: collectionsJson.success ? collectionsJson.data.total : 0,
          recentOrders: ordersJson.success ? ordersJson.data.items || [] : [],
          recentProducts: productsJson.success ? productsJson.data.items || [] : [],
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      href: "/admin/products",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      href: "/admin/orders",
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Categories",
      value: stats?.totalCategories || 0,
      icon: Tags,
      href: "/admin/categories",
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Collections",
      value: stats?.totalCollections || 0,
      icon: FolderTree,
      href: "/admin/collections",
      color: "bg-amber-50 text-amber-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-noir" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display uppercase tracking-widest">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-display mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display uppercase tracking-wider">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-noir transition-colors">
              View All
            </Link>
          </div>
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{order.firstName} {order.lastName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
          )}
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display uppercase tracking-wider">Recent Products</h2>
            <Link href="/admin/products" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-noir transition-colors">
              View All
            </Link>
          </div>
          {stats?.recentProducts && stats.recentProducts.length > 0 ? (
            <div className="space-y-4">
              {stats.recentProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 py-3 border-b last:border-0">
                  <div className="w-12 h-16 bg-muted rounded overflow-hidden relative flex-shrink-0">
                    {product.images?.[0] ? (
                      <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground uppercase">No Img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">${product.price.toFixed(2)}</p>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${product.isActive ? 'bg-green-50 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                    {product.isActive ? 'Active' : 'Draft'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No products yet</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/products/new" className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer text-center">
          <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Add New Product</p>
        </Link>
        <Link href="/admin/collections" className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer text-center">
          <FolderTree className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Manage Collections</p>
        </Link>
        <Link href="/admin/categories" className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer text-center">
          <Tags className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Manage Categories</p>
        </Link>
      </div>
    </div>
  );
}
