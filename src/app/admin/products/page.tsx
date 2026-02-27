"use client";

import { useEffect, useState } from "react";
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/products?perPage=50");
      const json = await res.json();
      if (json.success) {
        setProducts(json.data.items);
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
        },
      });
      if (res.ok) {
        toast.success("Product deleted");
        fetchProducts();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || 
           (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-widest">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your catalog, pricing, and inventory.</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="bg-card border rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-9 h-10 border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground ml-auto">
            {filteredProducts.length} product(s)
          </div>
        </div>

        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground font-medium">
              <tr className="border-b transition-colors">
                <th className="h-12 px-4 align-middle w-[60px]">Image</th>
                <th className="h-12 px-4 align-middle">Product Details</th>
                <th className="h-12 px-4 align-middle">Status</th>
                <th className="h-12 px-4 align-middle">Inventory</th>
                <th className="h-12 px-4 align-middle text-right">Price</th>
                <th className="h-12 px-4 align-middle w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="h-32 text-center text-muted-foreground">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-32 text-center text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const primaryImage = product.images?.[0];
                  
                  return (
                    <tr key={product.id} className="border-b transition-colors hover:bg-muted/30">
                      <td className="p-4 align-middle">
                        <div className="w-12 h-16 bg-muted relative rounded-sm overflow-hidden border">
                          {primaryImage ? (
                            <Image 
                              src={primaryImage.url} 
                              alt={product.name} 
                              fill 
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground uppercase">
                              No Img
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          SKU: {product.sku || "N/A"}
                        </div>
                      </td>
                      <td className="p-4 align-middle space-y-2">
                        <div>
                          {product.isActive ? (
                            <Badge variant="outline" className="border-green-500/20 text-green-700 bg-green-50">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                        </div>
                        {product.isFeatured && (
                          <Badge variant="outline" className="border-rose-300 text-rose-700 bg-rose-50 text-[10px]">Featured</Badge>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <div className={cn(
                          "font-medium", 
                          product.stock === 0 ? "text-destructive" : "text-foreground"
                        )}>
                          {product.stock} in stock
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          </div>
                      </td>
                      <td className="p-4 align-middle text-right font-medium">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/products/${product.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(product.id, product.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
