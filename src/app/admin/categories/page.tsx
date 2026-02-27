"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
  imageUrl: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  parent?: Category | null;
  children?: Category[];
  order: number;
  isActive: boolean;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.success) {
        setCategories(json.data.items || []);
      }
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Category deleted");
        fetchCategories();
      } else {
        toast.error("Failed to delete category");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const rootCategories = filteredCategories.filter((c) => !c.parentId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-widest">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize your products with categories and subcategories.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2"
              onClick={() => {
                setEditingCategory(null);
              }}
            >
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="uppercase tracking-wider">
                {editingCategory ? "Edit Category" : "New Category"}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={editingCategory}
              categories={categories}
              onSuccess={() => {
                setIsDialogOpen(false);
                fetchCategories();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-9 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground ml-auto">
            {filteredCategories.length} category(s)
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            No categories found.
          </div>
        ) : (
          <div className="divide-y">
            {rootCategories.map((category) => (
              <div key={category.id} className="p-4 flex items-center gap-4">
                {category.imageUrl && (
                  <div className="w-12 h-12 relative rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{category.name}</div>
                  <div className="text-xs text-muted-foreground">/{category.slug}</div>
                </div>
                <div className="flex items-center gap-2">
                  {!category.isActive && (
                    <span className="text-xs px-2 py-1 bg-muted rounded">Inactive</span>
                  )}
                  {categories.filter((c) => c.parentId === category.id).length > 0 && (
                    <span className="text-xs px-2 py-1 bg-secondary rounded">
                      {categories.filter((c) => c.parentId === category.id).length} subcategories
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingCategory(category);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-destructive"
                    onClick={() => handleDelete(category.id, category.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryForm({
  category,
  categories,
  onSuccess,
}: {
  category: Category | null;
  categories: Category[];
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      isActive: true,
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        parentId: category.parentId || "",
        isActive: category.isActive,
        imageUrl: category.imageUrl || "",
      });
    }
  }, [category, reset]);

  const isActive = watch("imageUrl");

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const token = useAuthStore.getState().accessToken;
      const method = category ? "PUT" : "POST";
      const url = category ? `/api/categories/${category.id}` : "/api/categories";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (json.success) {
        toast.success(category ? "Category updated" : "Category created");
        onSuccess();
      } else {
        toast.error(json.error || "Failed to save category");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const parentOptions = categories.filter((c) => c.id !== category?.id);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          {...register("name")}
          onBlur={(e) => {
            if (!category) {
              setValue("slug", generateSlug(e.target.value));
            }
          }}
        />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="slug">Slug *</Label>
        <Input id="slug" {...register("slug")} />
        {errors.slug && <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} rows={3} />
      </div>

      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input id="imageUrl" {...register("imageUrl")} placeholder="https://..." />
      </div>

      {parentOptions.length > 0 && (
        <div>
          <Label htmlFor="parentId">Parent Category</Label>
          <select
            id="parentId"
            {...register("parentId")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">No parent (root category)</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Checkbox
          id="isActive"
          checked={watch("isActive")}
          onCheckedChange={(checked) => setValue("isActive", checked as boolean)}
        />
        <label htmlFor="isActive" className="text-sm cursor-pointer">
          Active
        </label>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        {category ? "Update" : "Create"} Category
      </Button>
    </form>
  );
}
