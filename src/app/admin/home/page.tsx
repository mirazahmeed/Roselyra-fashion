"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Save, 
  Image as ImageIcon, 
  Link2, 
  Sparkles, 
  Eye, 
  Grid, 
  Edit3, 
  Trash2,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { getAuthToken } from "@/lib/authToken";
import { Product } from "@/types";

interface SlotDefinition {
  num: number;
  title: string;
  defaultImg: string;
  defaultLink: string;
  defaultLabel: string;
  rowInfo: string;
  aspectClass: string;
}

const GRID_SLOTS: SlotDefinition[] = [
  {
    num: 1,
    title: "Left Hero Image",
    rowInfo: "Top Hero Section (Row 1)",
    defaultImg: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
    defaultLink: "",
    defaultLabel: "Shop Now",
    aspectClass: "aspect-[3/4]"
  },
  {
    num: 2,
    title: "Right Hero Image",
    rowInfo: "Top Hero Section (Row 1)",
    defaultImg: "https://images.unsplash.com/photo-1542295669297-4d352b042bca?q=80&w=2787&auto=format&fit=crop",
    defaultLink: "",
    defaultLabel: "Shop Now",
    aspectClass: "aspect-[3/4]"
  },
  {
    num: 3,
    title: "Bags Background",
    rowInfo: "Bags & New (Row 2)",
    defaultImg: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=3149&auto=format&fit=crop",
    defaultLink: "/collections/bags",
    defaultLabel: "Shop bags",
    aspectClass: "aspect-video"
  },
  {
    num: 4,
    title: "Luxury Sparkle",
    rowInfo: "Bags & New (Row 2)",
    defaultImg: "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?q=80&w=774&auto=format&fit=crop",
    defaultLink: "/collections/new",
    defaultLabel: "Course in luxury",
    aspectClass: "aspect-video"
  },
  {
    num: 5,
    title: "Roses Image",
    rowInfo: "Romance & Editorial (Row 3)",
    defaultImg: "https://images.unsplash.com/photo-1600091166971-7f9faad6c1e2?q=80&w=3148&auto=format&fit=crop",
    defaultLink: "/collections/rose",
    defaultLabel: "Romance",
    aspectClass: "aspect-video"
  },
  {
    num: 6,
    title: "Editorial Image",
    rowInfo: "Romance & Editorial (Row 3)",
    defaultImg: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=3270&auto=format&fit=crop",
    defaultLink: "/collections/editorial",
    defaultLabel: "Cruise In Focus",
    aspectClass: "aspect-video"
  },
  {
    num: 7,
    title: "Black White Rose",
    rowInfo: "Dark & Minimal (Row 4)",
    defaultImg: "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?q=80&w=774&auto=format&fit=crop",
    defaultLink: "/collections/dark",
    defaultLabel: "Summer of Romance",
    aspectClass: "aspect-video"
  },
  {
    num: 8,
    title: "Minimal Image",
    rowInfo: "Dark & Minimal (Row 4)",
    defaultImg: "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?q=80&w=774&auto=format&fit=crop",
    defaultLink: "/collections/minimal",
    defaultLabel: "Course Luxury",
    aspectClass: "aspect-video"
  },
  {
    num: 9,
    title: "Crochet Image",
    rowInfo: "Crochet & Bottom (Row 5)",
    defaultImg: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2724&auto=format&fit=crop",
    defaultLink: "/collections/crochet",
    defaultLabel: "Crochet Artifacts",
    aspectClass: "aspect-video"
  },
  {
    num: 10,
    title: "Bottom Right Image",
    rowInfo: "Crochet & Bottom (Row 5)",
    defaultImg: "https://images.unsplash.com/photo-1645292155425-1126d1a03d21?q=80&w=627&auto=format&fit=crop",
    defaultLink: "/collections/artifacts",
    defaultLabel: "Art Pieces",
    aspectClass: "aspect-video"
  }
];

export default function AdminHome() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
  const [config, setConfig] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSlotNum, setSelectedSlotNum] = useState<number>(1);

  useEffect(() => {
    fetch("/api/home-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setConfig(data.data || {});
        }
      });
    
    fetch("/api/products?perPage=150")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.data?.items || []);
        }
      });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, num: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imgKey = `hero${num}`;
    setIsUploading((prev) => ({ ...prev, [imgKey]: true }));
    const token = getAuthToken();

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
        setConfig((prev) => ({ ...prev, [imgKey]: json.data.url }));
        toast.success("New image uploaded & connected!");
      } else {
        toast.error(`Failed to upload image`);
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading((prev) => ({ ...prev, [imgKey]: false }));
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
      const token = getAuthToken();
      // Remove any MongoDB internal _id properties from payload
      const { _id, ...cleanConfig } = config as any;

      const res = await fetch("/api/home-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanConfig),
      });

      if (res.ok) {
        toast.success("Storefront layout successfully updated!");
      } else {
        toast.error("Failed to save layout changes");
      }
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSlot = GRID_SLOTS.find(s => s.num === selectedSlotNum) || GRID_SLOTS[0];

  const getSlotDetails = (s: SlotDefinition) => {
    const customImg = config[`hero${s.num}`];
    const productId = config[`hero${s.num}Product`];
    const customLink = config[`hero${s.num}Link`];
    const customLabel = config[`hero${s.num}Label`];

    const linkedProduct = productId ? products.find(p => p.id === productId) : null;
    const finalImage = customImg || linkedProduct?.images?.[0]?.url || s.defaultImg;
    
    let finalLabel = customLabel || s.defaultLabel;
    let finalLink = s.defaultLink;
    let typeDescription = "Default behavior";

    if (linkedProduct) {
      finalLabel = customLabel || linkedProduct.name;
      finalLink = `/products/${linkedProduct.slug}`;
      typeDescription = `Linked to product: ${linkedProduct.name}`;
    } else if (customLink) {
      finalLink = customLink;
      typeDescription = `Custom Link: ${customLink}`;
    }

    return {
      finalImage,
      finalLabel,
      finalLink,
      typeDescription,
      customImg,
      productId,
      customLink,
      customLabel,
      linkedProduct
    };
  };

  const activeDetails = getSlotDetails(selectedSlot);

  const updateField = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const resetSlot = (num: number) => {
    setConfig(prev => {
      const next = { ...prev };
      delete next[`hero${num}`];
      delete next[`hero${num}Product`];
      delete next[`hero${num}Link`];
      delete next[`hero${num}Label`];
      return next;
    });
    toast.success(`Cleared custom overrides for slot ${num}`);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-display uppercase tracking-widest text-noir">Home Screen Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build your visual storefront layout. Click any grid cell to fully configure its content, banners, overlays, and links.
          </p>
        </div>
        <Button 
          onClick={onSubmit} 
          disabled={isLoading} 
          className="gap-2 bg-noir hover:bg-noir/90 text-cream uppercase text-xs tracking-widest font-bold px-6 py-5 rounded-none shadow-md transition-all duration-300"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Publish Layout
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: VISUAL HOMEPAGE PREVIEW (8/12) */}
        <div className="xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-4 py-2 bg-noir text-cream/90 text-xs font-semibold tracking-widest uppercase rounded-t-lg">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-rose-400" />
              Storefront Preview & Layout Editor
            </span>
            <span className="text-[10px] text-muted-foreground">Click a slot to edit</span>
          </div>

          <div className="border border-noir/25 bg-cream/40 p-4 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto rounded-b-lg shadow-inner">
            {/* ROW 1 PREVIEW */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">Top Hero Section (Row 1)</p>
              <div className="grid grid-cols-2 gap-4">
                {[GRID_SLOTS[0], GRID_SLOTS[1]].map((s) => {
                  const details = getSlotDetails(s);
                  const isSelected = selectedSlotNum === s.num;
                  return (
                    <div 
                      key={s.num}
                      onClick={() => setSelectedSlotNum(s.num)}
                      className={`relative cursor-pointer transition-all duration-300 group overflow-hidden border ${
                        isSelected 
                          ? "ring-4 ring-noir ring-offset-2 border-noir scale-[1.01]" 
                          : "border-noir/10 hover:border-noir/50 hover:scale-[1.005]"
                      }`}
                    >
                      <div className="relative aspect-[3/4] bg-muted w-full">
                        <Image 
                          src={details.finalImage} 
                          alt={s.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute bottom-4 left-4 z-10 text-cream">
                          <span className="text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 bg-black/45 backdrop-blur-md inline-block mb-1">
                            {details.finalLabel}
                          </span>
                          {details.linkedProduct && (
                            <p className="text-[10px] text-cream/80 block">${details.linkedProduct.price}</p>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1">
                          <span className="text-[9px] bg-noir/70 text-cream px-1.5 py-0.5 rounded font-mono font-bold">
                            Slot {s.num}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ROW 2 PREVIEW */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold font-sans">Bags & New (Row 2)</p>
              <div className="grid grid-cols-2 gap-4">
                {[GRID_SLOTS[2], GRID_SLOTS[3]].map((s) => {
                  const details = getSlotDetails(s);
                  const isSelected = selectedSlotNum === s.num;
                  return (
                    <div 
                      key={s.num}
                      onClick={() => setSelectedSlotNum(s.num)}
                      className={`relative cursor-pointer transition-all duration-300 group overflow-hidden border ${
                        isSelected 
                          ? "ring-4 ring-noir ring-offset-2 border-noir scale-[1.01]" 
                          : "border-noir/10 hover:border-noir/50 hover:scale-[1.005]"
                      }`}
                    >
                      <div className="relative aspect-[4/3] md:aspect-video bg-[#881416] w-full">
                        <Image 
                          src={details.finalImage} 
                          alt={s.title}
                          fill
                          className="object-cover mix-blend-overlay opacity-80 transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute bottom-4 right-4 z-10 text-cream text-right">
                          <span className="text-[10px] uppercase tracking-widest font-bold border-b border-cream/50 pb-1">
                            {details.finalLabel}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="text-[9px] bg-noir/70 text-cream px-1.5 py-0.5 rounded font-mono font-bold">
                            Slot {s.num}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ROW 3 PREVIEW */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">Romance & Editorial (Row 3)</p>
              <div className="grid grid-cols-2 gap-4">
                {[GRID_SLOTS[4], GRID_SLOTS[5]].map((s) => {
                  const details = getSlotDetails(s);
                  const isSelected = selectedSlotNum === s.num;
                  return (
                    <div 
                      key={s.num}
                      onClick={() => setSelectedSlotNum(s.num)}
                      className={`relative cursor-pointer transition-all duration-300 group overflow-hidden border ${
                        isSelected 
                          ? "ring-4 ring-noir ring-offset-2 border-noir scale-[1.01]" 
                          : "border-noir/10 hover:border-noir/50 hover:scale-[1.005]"
                      }`}
                    >
                      <div className="relative aspect-[4/3] md:aspect-video bg-muted w-full">
                        <Image 
                          src={details.finalImage} 
                          alt={s.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute top-1/2 left-4 -translate-y-1/2 z-10 text-noir font-bold">
                          <span className="text-[10px] uppercase tracking-widest">
                            {details.finalLabel}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="text-[9px] bg-noir/70 text-cream px-1.5 py-0.5 rounded font-mono font-bold">
                            Slot {s.num}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ROW 4 PREVIEW */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold font-sans">Dark & Minimal (Row 4)</p>
              <div className="grid grid-cols-2 gap-4">
                {[GRID_SLOTS[6], GRID_SLOTS[7]].map((s) => {
                  const details = getSlotDetails(s);
                  const isSelected = selectedSlotNum === s.num;
                  return (
                    <div 
                      key={s.num}
                      onClick={() => setSelectedSlotNum(s.num)}
                      className={`relative cursor-pointer transition-all duration-300 group overflow-hidden border ${
                        isSelected 
                          ? "ring-4 ring-noir ring-offset-2 border-noir scale-[1.01]" 
                          : "border-noir/10 hover:border-noir/50 hover:scale-[1.005]"
                      }`}
                    >
                      <div className="relative aspect-[4/3] md:aspect-video bg-noir w-full">
                        <Image 
                          src={details.finalImage} 
                          alt={s.title}
                          fill
                          className="object-cover mix-blend-luminosity opacity-90 transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30" />
                        <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10 text-cream font-bold text-right">
                          <span className="text-[10px] uppercase tracking-widest">
                            {details.finalLabel}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="text-[9px] bg-noir/70 text-cream px-1.5 py-0.5 rounded font-mono font-bold">
                            Slot {s.num}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ROW 5 PREVIEW */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold font-sans">Crochet & Bottom (Row 5)</p>
              <div className="grid grid-cols-2 gap-4">
                {[GRID_SLOTS[8], GRID_SLOTS[9]].map((s) => {
                  const details = getSlotDetails(s);
                  const isSelected = selectedSlotNum === s.num;
                  return (
                    <div 
                      key={s.num}
                      onClick={() => setSelectedSlotNum(s.num)}
                      className={`relative cursor-pointer transition-all duration-300 group overflow-hidden border ${
                        isSelected 
                          ? "ring-4 ring-noir ring-offset-2 border-noir scale-[1.01]" 
                          : "border-noir/10 hover:border-noir/50 hover:scale-[1.005]"
                      }`}
                    >
                      <div className="relative aspect-[4/3] md:aspect-video bg-[#111] w-full">
                        <Image 
                          src={details.finalImage} 
                          alt={s.title}
                          fill
                          className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute top-1/2 left-4 -translate-y-1/2 z-10 text-cream font-bold">
                          <span className="text-[10px] uppercase tracking-widest">
                            {details.finalLabel}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="text-[9px] bg-noir/70 text-cream px-1.5 py-0.5 rounded font-mono font-bold">
                            Slot {s.num}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SLOT CONFIGURATION PANEL (5/12) */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-card border border-noir/15 rounded-lg shadow-sm overflow-hidden">
            {/* SLOT HEADER */}
            <div className="bg-noir p-5 text-cream flex items-center justify-between">
              <div>
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-rose-300">
                  {selectedSlot.rowInfo}
                </span>
                <h3 className="text-xl font-display uppercase tracking-widest mt-1">
                  Slot {selectedSlot.num}: {selectedSlot.title}
                </h3>
              </div>
              <span className="h-10 w-10 flex items-center justify-center rounded-full bg-cream text-noir font-mono font-black text-sm">
                #{selectedSlot.num}
              </span>
            </div>

            {/* SLOT CONTENT */}
            <div className="p-6 space-y-6">
              {/* IMAGE MANAGER */}
              <div className="space-y-3">
                <label className="text-xs tracking-wider uppercase font-bold text-noir flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  Hero Image Source
                </label>
                <div className="relative aspect-video w-full bg-muted border border-dashed border-noir/20 rounded-md overflow-hidden flex items-center justify-center">
                  <Image
                    src={activeDetails.finalImage}
                    alt="Active slot image"
                    fill
                    className="object-cover"
                  />
                  {isUploading[`hero${selectedSlot.num}`] && (
                    <div className="absolute inset-0 bg-background/75 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="mt-2 text-sm font-medium">Uploading to library...</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <input
                      type="file"
                      id={`upload-${selectedSlot.num}`}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, selectedSlot.num)}
                      disabled={isUploading[`hero${selectedSlot.num}`]}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full text-xs uppercase tracking-widest font-semibold border-noir text-noir hover:bg-noir hover:text-cream rounded-none h-10 transition-colors"
                      onClick={() => document.getElementById(`upload-${selectedSlot.num}`)?.click()}
                      disabled={isUploading[`hero${selectedSlot.num}`]}
                    >
                      Upload New
                    </Button>
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={!activeDetails.customImg}
                      onClick={() => updateField(`hero${selectedSlot.num}`, "")}
                      className="w-full text-xs uppercase tracking-widest font-semibold text-destructive hover:bg-destructive/10 rounded-none h-10 transition-all"
                    >
                      Clear Upload
                    </Button>
                  </div>
                </div>
              </div>

              {/* OVERLAY LINK MANAGER */}
              <div className="space-y-4 border-t pt-5">
                <label className="text-xs tracking-wider uppercase font-bold text-noir flex items-center gap-1.5">
                  <Link2 className="w-4 h-4" />
                  Overlay Link Target
                </label>

                {/* PRODUCT LINK SELECT */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Link directly to product (recommeneded)
                  </span>
                  <select
                    value={activeDetails.productId || ""}
                    onChange={(e) => {
                      updateField(`hero${selectedSlot.num}Product`, e.target.value);
                      // Clear custom link to avoid conflicts
                      if (e.target.value) {
                        updateField(`hero${selectedSlot.num}Link`, "");
                      }
                    }}
                    className="w-full border border-noir/20 focus:border-noir bg-cream/20 rounded-none px-3 py-2 text-xs h-10 font-medium transition-all"
                  >
                    <option value="">No product linked</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ${p.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* OR CUSTOM LINK */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Or custom link / collection URL
                  </span>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. /collections/rose or /shop"
                      value={activeDetails.customLink || ""}
                      onChange={(e) => {
                        updateField(`hero${selectedSlot.num}Link`, e.target.value);
                        // Clear product link to avoid conflicts
                        if (e.target.value) {
                          updateField(`hero${selectedSlot.num}Product`, "");
                        }
                      }}
                      className="w-full border border-noir/20 focus:border-noir bg-cream/20 rounded-none px-3 py-2 text-xs h-10 font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* TEXT OVERLAY MANAGER */}
              <div className="space-y-2 border-t pt-5">
                <label className="text-xs tracking-wider uppercase font-bold text-noir flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4" />
                  Custom Overlay Title / Button Label
                </label>
                <input
                  type="text"
                  placeholder={`Fallback: "${selectedSlot.defaultLabel}"`}
                  value={activeDetails.customLabel || ""}
                  onChange={(e) => updateField(`hero${selectedSlot.num}Label`, e.target.value)}
                  className="w-full border border-noir/20 focus:border-noir bg-cream/20 rounded-none px-3 py-2 text-xs h-10 font-medium transition-all"
                />
                <p className="text-[10px] text-muted-foreground italic">
                  Leave blank to use the linked product's name or the layout fallback.
                </p>
              </div>

              {/* SLOT METADATA / STATS */}
              <div className="bg-cream/40 p-4 border border-noir/10 rounded-md space-y-2 text-xs">
                <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold">
                  <span>Routing Rule</span>
                  <span className="text-noir font-normal lowercase tracking-normal">
                    {activeDetails.typeDescription}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold">
                  <span>Link Path</span>
                  <span className="text-noir font-mono break-all font-semibold">
                    {activeDetails.finalLink || "(none)"}
                  </span>
                </div>
              </div>

              {/* RESET SLOT BUTTON */}
              <div className="flex items-center justify-between border-t pt-5">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Overrides active
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => resetSlot(selectedSlot.num)}
                  className="text-xs text-destructive border-destructive/20 hover:border-destructive hover:bg-destructive/10 gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Restore Defaults
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
