"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Loader2, Star } from "lucide-react";
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

const collectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  season: z.string().optional(),
  year: z.coerce.number().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  season: string | null;
  year: number | null;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
}

export default function AdminCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/collections");
      const json = await res.json();
      if (json.success) {
        setCollections(json.data.items || []);
      }
    } catch (error) {
      toast.error("Failed to fetch collections");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`/api/collections/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Collection deleted");
        fetchCollections();
      } else {
        toast.error("Failed to delete collection");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const filteredCollections = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-widest">Collections</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create seasonal collections and capsule wardrobes.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2"
              onClick={() => {
                setEditingCollection(null);
              }}
            >
              <Plus className="w-4 h-4" /> Add Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="uppercase tracking-wider">
                {editingCollection ? "Edit Collection" : "New Collection"}
              </DialogTitle>
            </DialogHeader>
            <CollectionForm
              collection={editingCollection}
              onSuccess={() => {
                setIsDialogOpen(false);
                fetchCollections();
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
              placeholder="Search collections..."
              className="pl-9 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground ml-auto">
            {filteredCollections.length} collection(s)
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            No collections found.
          </div>
        ) : (
          <div className="divide-y">
            {filteredCollections.map((collection) => (
              <div key={collection.id} className="p-4 flex items-center gap-4">
                {collection.imageUrl ? (
                  <div className="w-16 h-16 relative rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={collection.imageUrl}
                      alt={collection.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 relative rounded-md bg-muted flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground uppercase">No Img</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{collection.name}</span>
                    {collection.isFeatured && (
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    /{collection.slug}
                    {collection.season && collection.year && (
                      <span className="ml-2">
                        {collection.season} {collection.year}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!collection.isActive && (
                    <span className="text-xs px-2 py-1 bg-muted rounded">Inactive</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingCollection(collection);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-destructive"
                    onClick={() => handleDelete(collection.id, collection.name)}
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

function CollectionForm({
  collection,
  onSuccess,
}: {
  collection: Collection | null;
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      isFeatured: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (collection) {
      reset({
        name: collection.name,
        slug: collection.slug,
        description: collection.description || "",
        season: collection.season || "",
        year: collection.year || undefined,
        imageUrl: collection.imageUrl || "",
        videoUrl: collection.videoUrl || "",
        isFeatured: collection.isFeatured,
        isActive: collection.isActive,
      });
    }
  }, [collection, reset]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const onSubmit = async (data: CollectionFormData) => {
    try {
      const token = useAuthStore.getState().accessToken;
      const method = collection ? "PUT" : "POST";
      const url = collection
        ? `/api/collections/${collection.id}`
        : "/api/collections";

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
        toast.success(collection ? "Collection updated" : "Collection created");
        onSuccess();
      } else {
        toast.error(json.error || "Failed to save collection");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          {...register("name")}
          onBlur={(e) => {
            if (!collection) {
              setValue("slug", generateSlug(e.target.value));
            }
          }}
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="slug">Slug *</Label>
        <Input id="slug" {...register("slug")} />
        {errors.slug && (
          <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="season">Season</Label>
          <Input
            id="season"
            {...register("season")}
            placeholder="e.g., Spring/Summer"
          />
        </div>
        <div>
          <Label htmlFor="year">Year</Label>
          <Input id="year" type="number" {...register("year")} placeholder="2026" />
        </div>
      </div>

      <div>
        <Label htmlFor="imageUrl">Cover Image URL</Label>
        <Input id="imageUrl" {...register("imageUrl")} placeholder="https://..." />
      </div>

      <div>
        <Label htmlFor="videoUrl">Video URL (optional)</Label>
        <Input id="videoUrl" {...register("videoUrl")} placeholder="https://..." />
      </div>

      <div className="flex items-center gap-3">
        <Checkbox
          id="isFeatured"
          checked={watch("isFeatured")}
          onCheckedChange={(checked) => setValue("isFeatured", checked as boolean)}
        />
        <label htmlFor="isFeatured" className="text-sm cursor-pointer">
          Featured on homepage
        </label>
      </div>

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
        {collection ? "Update" : "Create"} Collection
      </Button>
    </form>
  );
}
