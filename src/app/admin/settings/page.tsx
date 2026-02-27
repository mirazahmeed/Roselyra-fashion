"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Store, Mail, Truck, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

const settingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeEmail: z.string().email("Valid email is required"),
  storePhone: z.string().optional(),
  storeAddress: z.string().optional(),
  freeShippingThreshold: z.coerce.number().min(0),
  defaultShippingCost: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).max(100),
  stripePublishableKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  cloudinaryCloudName: z.string().optional(),
  cloudinaryApiKey: z.string().optional(),
  cloudinaryApiSecret: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function AdminSettings() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: "Roselyra",
      storeEmail: "contact@roselyra.com",
      freeShippingThreshold: 500,
      defaultShippingCost: 25,
      taxRate: 10,
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true);
    try {
      // In a real app, you'd save to database
      console.log("Saving settings:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display uppercase tracking-widest">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your store settings and integrations.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <div className="bg-card border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b">
            <Store className="w-5 h-5" />
            <h2 className="text-lg font-semibold uppercase tracking-wider">
              Store Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="storeName">Store Name</Label>
              <Input id="storeName" {...register("storeName")} />
              {errors.storeName && (
                <p className="text-sm text-destructive mt-1">
                  {errors.storeName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="storeEmail">Contact Email</Label>
              <Input id="storeEmail" type="email" {...register("storeEmail")} />
              {errors.storeEmail && (
                <p className="text-sm text-destructive mt-1">
                  {errors.storeEmail.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="storePhone">Phone Number</Label>
              <Input id="storePhone" {...register("storePhone")} />
            </div>

            <div>
              <Label htmlFor="storeAddress">Address</Label>
              <Input id="storeAddress" {...register("storeAddress")} />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b">
            <Truck className="w-5 h-5" />
            <h2 className="text-lg font-semibold uppercase tracking-wider">
              Shipping & Tax
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="freeShippingThreshold">
                Free Shipping Threshold ($)
              </Label>
              <Input
                id="freeShippingThreshold"
                type="number"
                {...register("freeShippingThreshold")}
              />
            </div>

            <div>
              <Label htmlFor="defaultShippingCost">
                Default Shipping Cost ($)
              </Label>
              <Input
                id="defaultShippingCost"
                type="number"
                {...register("defaultShippingCost")}
              />
            </div>

            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input id="taxRate" type="number" step="0.1" {...register("taxRate")} />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b">
            <CreditCard className="w-5 h-5" />
            <h2 className="text-lg font-semibold uppercase tracking-wider">
              Payment Integration
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stripePublishableKey">
                Stripe Publishable Key
              </Label>
              <Input
                id="stripePublishableKey"
                placeholder="pk_test_..."
                {...register("stripePublishableKey")}
              />
            </div>

            <div>
              <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
              <Input
                id="stripeSecretKey"
                type="password"
                placeholder="sk_test_..."
                {...register("stripeSecretKey")}
              />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b">
            <Mail className="w-5 h-5" />
            <h2 className="text-lg font-semibold uppercase tracking-wider">
              Cloudinary (Media)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cloudinaryCloudName">Cloud Name</Label>
              <Input
                id="cloudinaryCloudName"
                placeholder="your-cloud-name"
                {...register("cloudinaryCloudName")}
              />
            </div>

            <div>
              <Label htmlFor="cloudinaryApiKey">API Key</Label>
              <Input
                id="cloudinaryApiKey"
                {...register("cloudinaryApiKey")}
              />
            </div>

            <div>
              <Label htmlFor="cloudinaryApiSecret">API Secret</Label>
              <Input
                id="cloudinaryApiSecret"
                type="password"
                {...register("cloudinaryApiSecret")}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
