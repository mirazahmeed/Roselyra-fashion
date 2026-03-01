"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { auth } from "@/lib/firebase";
import { signOut as firebaseSignOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Package, MapPin, CreditCard, ChevronRight, Eye } from "lucide-react";
import toast from "react-hot-toast";

const useHydrated = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
};

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  createdAt: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    size?: string | null;
    color?: string | null;
  }>;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<string, string> = {
  UNPAID: "bg-red-100 text-red-800",
  PARTIAL: "bg-orange-100 text-orange-800",
  PAID: "bg-green-100 text-green-800",
};

export default function AccountPage() {
  const router = useRouter();
  const { user, accessToken, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated && !user) {
      router.push("/login");
    }
  }, [hydrated, user, router]);

  useEffect(() => {
    if (hydrated && user) {
      setIsLoading(false);
    }
  }, [hydrated, user]);

  useEffect(() => {
    if (hydrated && user) {
      setProfileForm({
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
        phone: (user as any).phone || "",
        address: (user as any).address || "",
        city: (user as any).city || "",
        postalCode: (user as any).postalCode || "",
      });
    }
  }, [hydrated, user]);

  useEffect(() => {
    if (hydrated && user && accessToken) {
      setOrdersLoading(true);
      fetch("/api/orders?myOrders=true", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setOrders(data.data.items || []);
          }
        })
        .catch((err) => console.error("Failed to fetch orders:", err))
        .finally(() => setOrdersLoading(false));
    }
  }, [hydrated, user, accessToken]);

  const handleLogout = async () => {
    try {
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
      logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      logout();
      router.push("/");
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully");
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-noir" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-display uppercase tracking-widest mb-8">My Account</h1>

        <div className="bg-white shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeTab === "orders"
                  ? "bg-noir text-cream"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Package className="inline-block w-5 h-5 mr-2" />
              My Orders
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeTab === "profile"
                  ? "bg-noir text-cream"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <MapPin className="inline-block w-5 h-5 mr-2" />
              Profile
            </button>
          </div>

          <div className="p-6">
            {activeTab === "orders" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-display uppercase tracking-wider">
                    Order History
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (user && accessToken) {
                        setOrdersLoading(true);
                        fetch("/api/orders?myOrders=true", {
                          headers: {
                            Authorization: `Bearer ${accessToken}`,
                          },
                        })
                          .then((res) => res.json())
                          .then((data) => {
                            if (data.success && data.data) {
                              setOrders(data.data.items || []);
                            }
                          })
                          .catch((err) => console.error("Failed to fetch orders:", err))
                          .finally(() => setOrdersLoading(false));
                      }
                    }}
                  >
                    <Loader2 className={`w-4 h-4 mr-2 ${ordersLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>

                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-noir" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">No orders yet</p>
                    <Link
                      href="/products"
                      className="inline-block bg-noir text-cream px-6 py-2 hover:bg-gray-800 transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div>
                            <p className="font-medium text-lg">
                              Order #{order.orderNumber}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                statusColors[order.status] || "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                paymentStatusColors[order.paymentStatus] || "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                        </div>

                          <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="text-sm text-gray-600">
                            <p>
                              <span className="font-medium">Items:</span>{" "}
                              {order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0}
                            </p>
                            <p>
                              <span className="font-medium">Total:</span>{" "}
                              ৳{((order.total || order.subtotal || 0) + (order.shippingCost || 0) + (order.tax || 0)).toFixed(2)}
                            </p>
                          </div>
                          <Link
                            href={`/order/${order.orderNumber}`}
                            className="flex items-center gap-1 text-noir hover:underline"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || "User"}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-noir text-cream flex items-center justify-center text-2xl font-display">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-lg">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                {isEditing ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileForm.firstName}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, firstName: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileForm.lastName}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, lastName: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, phone: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={profileForm.address}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, address: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={profileForm.city}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, city: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          value={profileForm.postalCode}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, postalCode: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit">Save Changes</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{user?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{(user as any).phone || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{(user as any).address || "Not set"}</p>
                      </div>
                    </div>
                    <Button onClick={() => setIsEditing(true)} className="mt-4">
                      Edit Profile
                    </Button>
                  </div>
                )}

                <div className="border-t mt-8 pt-6">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
