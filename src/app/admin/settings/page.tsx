"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";

interface Settings {
  bkashNumber: string;
  bkashMerchantNumber: string;
  deliveryCharge: number;
  minAdvanceAmount: number;
  codEnabled: boolean;
  storeName: string;
  storeLogo: string | null;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  footerText: string;
}

export default function SettingsPage() {
  const { isEditor } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    bkashNumber: "",
    bkashMerchantNumber: "",
    deliveryCharge: 100,
    minAdvanceAmount: 100,
    codEnabled: true,
    storeName: "Roselyra",
    storeLogo: null,
    storeEmail: "contact@roselyra.com",
    storePhone: "",
    storeAddress: "",
    footerText: "© 2026 Roselyra. All rights reserved.",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.data);
        }
      });
  }, []);

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      const token = useAuthStore.getState().accessToken;
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Settings saved!");
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-widest">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage payment and store settings
          </p>
        </div>
        <Button onClick={onSubmit} disabled={isLoading} className="gap-2">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-display uppercase tracking-wider border-b pb-2">Payment Settings</h2>
          
          <div>
            <Label htmlFor="bkashNumber">bKash Payment Number</Label>
            <Input
              id="bkashNumber"
              value={settings.bkashNumber}
              onChange={(e) => setSettings({ ...settings, bkashNumber: e.target.value })}
              placeholder="01XXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground mt-1">Customers will send payment to this number</p>
          </div>

          <div>
            <Label htmlFor="bkashMerchantNumber">bKash Merchant Number (Optional)</Label>
            <Input
              id="bkashMerchantNumber"
              value={settings.bkashMerchantNumber}
              onChange={(e) => setSettings({ ...settings, bkashMerchantNumber: e.target.value })}
              placeholder="For payment API integration"
            />
          </div>

          <div>
            <Label htmlFor="deliveryCharge">Delivery Charge (Tk)</Label>
            <Input
              id="deliveryCharge"
              type="number"
              min="0"
              value={settings.deliveryCharge}
              onChange={(e) => setSettings({ ...settings, deliveryCharge: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label htmlFor="minAdvanceAmount">Minimum Advance Amount (Tk)</Label>
            <Input
              id="minAdvanceAmount"
              type="number"
              min="0"
              value={settings.minAdvanceAmount}
              onChange={(e) => setSettings({ ...settings, minAdvanceAmount: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-xs text-muted-foreground mt-1">Minimum amount required for partial/COD payments</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="codEnabled"
              checked={settings.codEnabled}
              onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="codEnabled" className="cursor-pointer">Enable Cash on Delivery</Label>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-display uppercase tracking-wider border-b pb-2">Store Information</h2>
          
          <div>
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="storeEmail">Store Email</Label>
            <Input
              id="storeEmail"
              type="email"
              value={settings.storeEmail}
              onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="storePhone">Store Phone</Label>
            <Input
              id="storePhone"
              value={settings.storePhone}
              onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
              placeholder="+8801XXXXXXXXX"
            />
          </div>

          <div>
            <Label htmlFor="storeAddress">Store Address</Label>
            <Input
              id="storeAddress"
              value={settings.storeAddress}
              onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="footerText">Footer Text</Label>
            <Input
              id="footerText"
              value={settings.footerText}
              onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
