"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { PageTransition } from "@/components/animations/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, CreditCard, Wallet, Phone } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface Settings {
  bkashNumber: string;
  deliveryCharge: number;
  minAdvanceAmount: number;
  codEnabled: boolean;
}

type PaymentOption = "FULL" | "COD" | "ADVANCE";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    bkashNumber: "",
    deliveryCharge: 100,
    minAdvanceAmount: 100,
    codEnabled: true,
  });
  const [paymentOption, setPaymentOption] = useState<PaymentOption>("FULL");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [bkashNumber, setBkashNumber] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.data);
          setBkashNumber(data.data.bkashNumber || "");
        }
      });
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [mounted, user, router]);

  const cartItems = items;
  const subtotalTotal = subtotal();
  const shipping = subtotalTotal >= 500 ? 0 : settings.deliveryCharge;
  const tax = subtotalTotal * 0.1;
  const total = subtotalTotal + shipping + tax;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const orderItems = cartItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
      size: item.size,
      color: item.color,
    }));

    const newOrderData = {
      ...data,
      items: orderItems,
      shippingCost: shipping,
      discount: 0,
      paymentType: paymentOption,
      userId: user?.id,
    };

    setOrderData(newOrderData);

    if (paymentOption === "FULL" || paymentOption === "ADVANCE") {
      setShowPaymentForm(true);
    } else {
      await placeOrder(newOrderData, null, null, 0);
    }
  };

  const placeOrder = async (orderData: any, senderNum: string | null, txId: string | null, paid: number) => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        const order = result.data;

        if (senderNum && txId && paid > 0) {
          await fetch("/api/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: order.id,
              method: "BKASH",
              senderNumber: senderNum,
              transactionId: txId,
              amount: paid,
            }),
          });
        }

        clearCart();
        toast.success("Order placed successfully!");
        router.push(`/order/${order.orderNumber}`);
      } else {
        toast.error(result.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An error occurred during checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senderNumber || !transactionId) {
      toast.error("Please enter bKash number and transaction ID");
      return;
    }

    const minAmount = paymentOption === "COD" ? settings.deliveryCharge : settings.minAdvanceAmount;
    if (paidAmount < minAmount) {
      toast.error(`Minimum amount is ${minAmount} Taka`);
      return;
    }

    await placeOrder(orderData, senderNumber, transactionId, paidAmount);
  };

  if (!mounted) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <PageTransition>
        <div className="pt-32 pb-24 min-h-screen">
          <div className="container mx-auto px-4 md:px-8 text-center">
            <h1 className="text-3xl font-display uppercase tracking-wider mb-4">Your bag is empty</h1>
            <p className="text-muted mb-8">Add some items to continue to checkout.</p>
            <Button asChild><a href="/shop">Continue Shopping</a></Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (showPaymentForm) {
    const minAmount = paymentOption === "COD" ? settings.deliveryCharge : settings.minAdvanceAmount;
    return (
      <PageTransition>
        <div className="pt-32 pb-24 min-h-screen">
          <div className="container mx-auto px-4 md:px-8 max-w-lg">
            <h1 className="text-3xl font-display uppercase tracking-wider mb-8 text-center">Payment</h1>
            
            <div className="bg-card border rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4 pb-4 border-b">
                <span className="text-muted-foreground">To Pay</span>
                <span className="text-xl font-bold">৳{(paymentOption === "COD" ? minAmount : total).toFixed(2)}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">bKash Number:</span> <strong>{bkashNumber || "Not configured"}</strong></p>
                <p className="text-xs text-muted-foreground">
                  Send money to this number, then enter your transaction details below.
                </p>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <Label>Your bKash Number *</Label>
                <Input
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  required
                />
              </div>
              
              <div>
                <Label>Transaction ID *</Label>
                <Input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                  required
                />
              </div>
              
              <div>
                <Label>Advance Amount (৳) *</Label>
                <Input
                  type="number"
                  min={minAmount}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum: ৳{minAmount} | Total: ৳{total}
                </p>
              </div>

              {paymentOption === "ADVANCE" && paidAmount > 0 && (
                <div className="bg-green-50 p-4 rounded text-sm">
                  <p className="font-medium">Extra Payment: ৳{(paidAmount - minAmount).toFixed(2)}</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Due on delivery: ৳{(total - paidAmount).toFixed(2)}
                  </p>
                </div>
              )}

              {paymentOption === "COD" && (
                <div className="bg-yellow-50 p-4 rounded text-sm">
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Pay ৳{minAmount} advance via bKash. Remaining amount will be collected on delivery.
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Payment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="pt-32 pb-24 min-h-screen">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-3xl md:text-5xl font-display uppercase tracking-wider mb-12 text-center">Checkout</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            <div className="space-y-8">
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-display uppercase tracking-wider mb-6">Shipping Information</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" {...register("firstName")} />
                    {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" {...register("lastName")} />
                    {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" {...register("phone")} />
                    {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="address">Address *</Label>
                  <Input id="address" {...register("address")} />
                  {errors.address && <p className="text-sm text-destructive mt-1">{errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" {...register("city")} />
                    {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input id="state" {...register("state")} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input id="postalCode" {...register("postalCode")} />
                    {errors.postalCode && <p className="text-sm text-destructive mt-1">{errors.postalCode.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" {...register("country")} defaultValue="Bangladesh" />
                    {errors.country && <p className="text-sm text-destructive mt-1">{errors.country.message}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-lg font-display uppercase tracking-wider mb-6">Payment Method</h2>
                
                <div className="space-y-3">
                  <label
                    className={cn(
                      "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all",
                      paymentOption === "FULL" ? "border-noir bg-noir/5" : "hover:border-gray-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentOption === "FULL"}
                      onChange={() => setPaymentOption("FULL")}
                      className="w-4 h-4"
                    />
                    <CreditCard className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Full Payment</p>
                      <p className="text-xs text-muted-foreground">Pay full amount via bKash</p>
                    </div>
                  </label>

                  {settings.codEnabled && (
                    <label
                      className={cn(
                        "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all",
                        paymentOption === "COD" ? "border-noir bg-noir/5" : "hover:border-gray-300"
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentOption === "COD"}
                        onChange={() => setPaymentOption("COD")}
                        className="w-4 h-4"
                      />
                      <Wallet className="w-5 h-5" />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-xs text-muted-foreground">
                          Pay ৳{settings.deliveryCharge} advance via bKash
                        </p>
                      </div>
                    </label>
                  )}

                  <label
                    className={cn(
                      "flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all",
                      paymentOption === "ADVANCE" ? "border-noir bg-noir/5" : "hover:border-gray-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentOption === "ADVANCE"}
                      onChange={() => setPaymentOption("ADVANCE")}
                      className="w-4 h-4"
                    />
                    <Phone className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Partial Payment</p>
                      <p className="text-xs text-muted-foreground">
                        Pay min ৳{settings.minAdvanceAmount} via bKash, rest on delivery
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card border rounded-lg p-6 sticky top-32">
                <h2 className="text-lg font-display uppercase tracking-wider mb-6">Order Summary</h2>

                <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6">
                  {cartItems.map((item) => (
                    <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4">
                      <div className="w-20 h-24 relative bg-muted rounded overflow-hidden flex-shrink-0">
                        {item.product.images?.[0] ? (
                          <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Img</div>
                        )}
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-noir text-cream rounded-full text-xs flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-2">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.color && `${item.color}`}
                          {item.size && ` / ${item.size}`}
                        </p>
                        <p className="text-sm mt-1">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotalTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  {paymentOption === "COD" && (
                    <div className="flex justify-between text-sm text-yellow-600">
                      <span>Pay Now (Advance)</span>
                      <span>৳{settings.deliveryCharge}</span>
                    </div>
                  )}
                  {paymentOption === "ADVANCE" && (
                    <>
                      <div className="flex justify-between text-sm text-yellow-600">
                        <span>Pay Now (Min)</span>
                        <span>৳{settings.minAdvanceAmount}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Pay more to reduce due</span>
                        <span>(Enter in payment step)</span>
                      </div>
                    </>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-6 h-12"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
