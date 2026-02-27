"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";

export default function AdminHome() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
  const [config, setConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/home-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setConfig(data.data || {});
        }
      });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading((prev) => ({ ...prev, [key]: true }));
    const token = useAuthStore.getState().accessToken;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        setConfig((prev) => ({ ...prev, [key]: json.data.url }));
        toast.success("Image uploaded!");
      } else {
        toast.error(`Failed to upload image`);
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading((prev) => ({ ...prev, [key]: false }));
      e.target.value = "";
    }
  };

  const onSubmit = async () => {
    const currentlyUploading = Object.values(isUploading).some((v) => v);
    if (currentlyUploading) {
      toast.error("Please wait for images to finish uploading");
      return;
    }

    setIsLoading(true);
    try {
      const token = useAuthStore.getState().accessToken;
      const res = await fetch("/api/home-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        toast.success("Home configuration saved!");
      } else {
        toast.error("Failed to save changes");
      }
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setIsLoading(false);
    }
  };

  const renderSlot = (title: string, key: string, fallback: string) => (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
      </div>
      
      <div className="relative aspect-[3/4] md:aspect-video w-full bg-muted rounded-md overflow-hidden border">
        <Image
          src={config[key] || fallback}
          alt={title}
          fill
          className="object-cover"
        />
        {isUploading[key] && (
          <div className="absolute inset-0 bg-background/50 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="mt-2 text-sm font-medium">Uploading...</span>
          </div>
        )}
      </div>

      <div>
        <input
          type="file"
          id={`upload-${key}`}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, key)}
          disabled={isUploading[key]}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={() => document.getElementById(`upload-${key}`)?.click()}
          disabled={isUploading[key]}
        >
          <ImageIcon className="w-4 h-4" />
          Change Image
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-widest">Home Page</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the hero images and sections on the storefront home page.
          </p>
        </div>
        <Button onClick={onSubmit} disabled={isLoading} className="gap-2">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Row 1 */}
        <div className="space-y-6">
          <h2 className="text-xl font-display uppercase tracking-wider border-b pb-2">Top Hero Section (Row 1)</h2>
          {renderSlot("Left Hero Image", "hero1", "https://images.unsplash.com/photo-1550614000-4b9ebd3df917?q=80&w=2803&auto=format&fit=crop")}
          {renderSlot("Right Hero Image", "hero2", "https://images.unsplash.com/photo-1542295669297-4d352b042bca?q=80&w=2787&auto=format&fit=crop")}
        </div>

        {/* Row 2 */}
        <div className="space-y-6">
          <h2 className="text-xl font-display uppercase tracking-wider border-b pb-2">Bags & New (Row 2)</h2>
          {renderSlot("Bags Background", "hero3", "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=3149&auto=format&fit=crop")}
          {renderSlot("Luxury Sparkle", "hero4", "https://images.unsplash.com/photo-1617013340578-8317e082855f?q=80&w=2787&auto=format&fit=crop")}
        </div>

        {/* Row 3 */}
        <div className="space-y-6">
          <h2 className="text-xl font-display uppercase tracking-wider border-b pb-2">Romance & Editorial (Row 3)</h2>
          {renderSlot("Roses Image", "hero5", "https://images.unsplash.com/photo-1600091166971-7f9faad6c1e2?q=80&w=3148&auto=format&fit=crop")}
          {renderSlot("Editorial Image", "hero6", "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=3270&auto=format&fit=crop")}
        </div>

        {/* Row 4 */}
        <div className="space-y-6">
          <h2 className="text-xl font-display uppercase tracking-wider border-b pb-2">Dark & Minimal (Row 4)</h2>
          {renderSlot("Black White Rose", "hero7", "https://images.unsplash.com/photo-1496360566367-1522f98cb0e2?q=80&w=2787&auto=format&fit=crop")}
          {renderSlot("Minimal Image", "hero8", "https://images.unsplash.com/photo-1549416878-b9ca95e1bbba?q=80&w=2787&auto=format&fit=crop")}
        </div>

        {/* Row 5 */}
        <div className="space-y-6">
          <h2 className="text-xl font-display uppercase tracking-wider border-b pb-2">Crochet & Bottom (Row 5)</h2>
          {renderSlot("Crochet Image", "hero9", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2724&auto=format&fit=crop")}
          {renderSlot("Bottom Right Image", "hero10", "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=3164&auto=format&fit=crop")}
        </div>
      </div>
    </div>
  );
}
