"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Upload, Image as ImageIcon, Loader2, Save } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  longDesc: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  comparePrice: z.coerce.number().optional(),
  sku: z.string().optional(),
  stock: z.coerce.number().int().min(0, "Stock must be positive"),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  categoryId: z.string().optional(),
  collectionId: z.string().optional(),
  material: z.string().optional(),
  fit: z.string().optional(),
  care: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  order: number;
  isPrimary: boolean;
}

interface ProductVariant {
  id: string;
  color: string;
  size: string;
  sku: string | null;
  stock: number;
  price: number | null;
}

export default function ProductForm() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id && params.id !== "new" ? params.id as string : null;
  const isEditing = !!productId;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [sizes, setSizes] = useState<string[]>(["XS", "S", "M", "L", "XL"]);
  const [newSize, setNewSize] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isFeatured: false,
      isActive: true,
      stock: 0,
      price: 0,
    },
  });

  const isFeatured = watch("isFeatured");
  const isActive = watch("isActive");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, colRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/collections"),
        ]);
        const catJson = await catRes.json();
        const colJson = await colRes.json();
        
        if (catJson.success) setCategories(catJson.data.items || []);
        if (colJson.success) setCollections(colJson.data.items || []);
      } catch (error) {
        console.error("Failed to fetch categories/collections:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!productId) return;
    
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const product = json.data;
          reset({
            name: product.name,
            slug: product.slug,
            description: product.description || "",
            longDesc: product.longDesc || "",
            price: product.price,
            comparePrice: product.comparePrice || undefined,
            sku: product.sku || "",
            stock: product.stock,
            isFeatured: product.isFeatured,
            isActive: product.isActive,
            categoryId: product.categoryId || "",
            collectionId: product.collectionId || "",
            material: product.material || "",
            fit: product.fit || "",
            care: product.care || "",
          });
          setImages(product.images || []);
          setSizes(product.sizes || ["XS", "S", "M", "L", "XL"]);
          setColors(product.colors || []);
          setTags(product.tags || []);
          setVariants(product.variants || []);
        }
      } catch (error) {
        toast.error("Failed to fetch product");
      } finally {
        setIsFetching(false);
      }
    };
    fetchProduct();
  }, [productId, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const token = useAuthStore.getState().accessToken;

    try {
      await Promise.all(
        Array.from(files).map(async (file, idx) => {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/media/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });

          const json = await res.json();
          if (json.success && json.data?.url) {
            const uploaded = json.data;
            setImages((prev) => [
              ...prev,
              {
                id: uploaded.id || `img_${Date.now()}_${idx}`,
                url: uploaded.url,
                altText: uploaded.altText || file.name,
                order: prev.length + idx,
                isPrimary: prev.length === 0 && idx === 0,
              },
            ]);
          } else {
            toast.error(`Failed to upload ${file.name}`);
          }
        })
      );
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
      // Reset file input so same file can be re-selected
      e.target.value = "";
    }
  };

  const removeExistingImage = async (imageId: string) => {
    if (!confirm("Remove this image?")) return;
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const addColor = () => {
    if (newColor && !colors.includes(newColor)) {
      setColors([...colors, newColor]);
      generateVariants([...colors, newColor], sizes);
      setNewColor("");
    }
  };

  const removeColor = (color: string) => {
    setColors(colors.filter((c) => c !== color));
    generateVariants(colors.filter((c) => c !== color), sizes);
  };

  const addSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize]);
      generateVariants(colors, [...sizes, newSize]);
      setNewSize("");
    }
  };

  const removeSize = (size: string) => {
    setSizes(sizes.filter((s) => s !== size));
    generateVariants(colors, sizes.filter((s) => s !== size));
  };

  const generateVariants = (productColors: string[], productSizes: string[]) => {
    const newVariants: ProductVariant[] = [];
    productColors.forEach((color) => {
      productSizes.forEach((size) => {
        const existing = variants.find((v) => v.color === color && v.size === size);
        if (existing) {
          newVariants.push(existing);
        } else {
          newVariants.push({
            id: `var_${Date.now()}_${color}_${size}`,
            color,
            size,
            sku: null,
            stock: 0,
            price: null,
          });
        }
      });
    });
    setVariants(newVariants);
  };

  const updateVariantStock = (variantId: string, stock: number) => {
    setVariants(variants.map((v) => 
      v.id === variantId ? { ...v, stock } : v
    ));
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const onSubmit = async (data: ProductFormData) => {
    if (isUploading) {
      toast.error("Please wait for images to finish uploading");
      return;
    }
    setIsLoading(true);
    try {
      const token = useAuthStore.getState().accessToken;
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/api/products/${productId}` : "/api/products";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          images: images.map((img) => img.url),
          sizes,
          colors,
          tags,
          variants,
        }),
      });

      const json = await res.json();
      
      if (json.success) {
        toast.success(isEditing ? "Product updated" : "Product created");
        router.push("/admin/products");
      } else {
        toast.error(json.error || "Failed to save product");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-noir" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-widest">
            {isEditing ? "Edit Product" : "New Product"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing ? "Update product details and images" : "Create a new product in your catalog"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isEditing ? "Update" : "Create"} Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold uppercase tracking-wider">Basic Information</h2>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  onBlur={(e) => {
                    if (!isEditing || !watch("slug")) {
                      setValue("slug", generateSlug(e.target.value));
                    }
                  }}
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input id="slug" {...register("slug")} />
                {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Short Description</Label>
                <Textarea id="description" {...register("description")} rows={3} />
              </div>

              <div>
                <Label htmlFor="longDesc">Long Description</Label>
                <Textarea id="longDesc" {...register("longDesc")} rows={6} />
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold uppercase tracking-wider">Pricing & Inventory</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="price" type="number" step="0.01" {...register("price")} className="pl-7" />
                </div>
                {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
              </div>

              <div>
                <Label htmlFor="comparePrice">Compare Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="comparePrice" type="number" step="0.01" {...register("comparePrice")} className="pl-7" />
                </div>
              </div>

              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" {...register("sku")} placeholder="e.g., ROS-SLK-001" />
              </div>

              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input id="stock" type="number" {...register("stock")} />
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold uppercase tracking-wider">Product Details</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  {...register("categoryId")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="collectionId">Collection</Label>
                <select
                  id="collectionId"
                  {...register("collectionId")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select collection</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>{col.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="material">Material</Label>
                <Input id="material" {...register("material")} placeholder="e.g., 100% Silk" />
              </div>

              <div>
                <Label htmlFor="fit">Fit</Label>
                <Input id="fit" {...register("fit")} placeholder="e.g., Oversized" />
              </div>

              <div className="col-span-2">
                <Label htmlFor="care">Care Instructions</Label>
                <Input id="care" {...register("care")} placeholder="e.g., Dry clean only" />
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold uppercase tracking-wider">Variants</h2>
            
            <div>
              <Label>Colors</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {colors.map((color) => (
                  <span
                    key={color}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
                  >
                    {color}
                    <button type="button" onClick={() => removeColor(color)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <Input
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Add color"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                />
                <Button type="button" variant="outline" onClick={addColor}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Sizes</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {sizes.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
                  >
                    {size}
                    <button type="button" onClick={() => removeSize(size)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <Input
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="Add size"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
                />
                <Button type="button" variant="outline" onClick={addSize}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {variants.length > 0 && (
              <div>
                <Label>Inventory by Color & Size</Label>
                <div className="mt-2 border rounded-md overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Color</th>
                        <th className="px-3 py-2 text-left font-medium">Size</th>
                        <th className="px-3 py-2 text-left font-medium">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((variant) => (
                        <tr key={variant.id} className="border-t">
                          <td className="px-3 py-2">{variant.color}</td>
                          <td className="px-3 py-2">{variant.size}</td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(e) => updateVariantStock(variant.id, parseInt(e.target.value) || 0)}
                              className="h-8 w-24"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold uppercase tracking-wider">Status</h2>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={isActive}
                  onCheckedChange={(checked) => setValue("isActive", checked as boolean)}
                />
                <span className="text-sm">Active (visible on store)</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={isFeatured}
                  onCheckedChange={(checked) => setValue("isFeatured", checked as boolean)}
                />
                <span className="text-sm">Featured (show on homepage)</span>
              </label>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold uppercase tracking-wider">Images</h2>
            
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {images.map((img, idx) => (
                  <div key={img.id} className="relative aspect-square bg-muted rounded-md overflow-hidden group">
                    <Image src={img.url} alt={img.altText || ""} fill className="object-cover" />
                    {img.isPrimary && (
                      <span className="absolute top-1 left-1 bg-noir text-cream text-[10px] px-2 py-0.5 uppercase">Primary</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className={cn(
              "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors",
              isUploading && "opacity-60 cursor-not-allowed"
            )}>
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-muted-foreground mb-2 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              )}
              <span className="text-sm text-muted-foreground">
                {isUploading ? "Uploading..." : "Click to upload images"}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
