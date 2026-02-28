"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PageTransition } from "@/components/animations/PageTransition";
import { Loader2, CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const statusSteps = [
  { status: "PENDING", label: "Order Placed", icon: Clock },
  { status: "PAYMENT_SUBMITTED", label: "Payment Submitted", icon: Clock },
  { status: "CONFIRMED", label: "Confirmed", icon: CheckCircle },
  { status: "PROCESSING", label: "Processing", icon: Package },
  { status: "SHIPPED", label: "Shipped", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: CheckCircle },
];

export default function OrderPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      fetch(`/api/orders?orderNumber=${orderNumber}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrder(data.data);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-display mb-4">Order Not Found</h1>
            <Button asChild><a href="/shop">Continue Shopping</a></Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.status === order.status);
  const total = order.subtotal + order.shippingCost + order.tax - order.discount;

  return (
    <PageTransition>
      <div className="min-h-screen bg-cream py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-display uppercase tracking-wider mb-2">
              Thank You!
            </h1>
            <p className="text-muted-foreground">
              Order #{order.orderNumber} has been placed successfully.
            </p>
          </div>

          <div className="bg-white border rounded-lg p-6 mb-8">
            <h2 className="text-lg font-display uppercase tracking-wider mb-6">Order Status</h2>
            
            <div className="flex justify-between items-center">
              {statusSteps.slice(0, -1).map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div key={step.status} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isCurrent
                          ? "bg-yellow-500 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs mt-2 text-center hidden md:block">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6 mb-8">
            <h2 className="text-lg font-display uppercase tracking-wider mb-6">Receipt</h2>
            
            <div className="flex justify-between items-start mb-6 pb-6 border-b">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-mono font-bold">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Date</p>
                <p>{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mb-6 pb-6 border-b">
              <h3 className="text-sm font-medium mb-3">Items</h3>
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between py-2">
                  <div>
                    <p className="text-sm">{item.product?.name || "Product"}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.color && `${item.color}`} {item.size && `/ ${item.size}`} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {order.paidAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Paid</span>
                    <span>-${order.paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Due</span>
                    <span>${order.dueAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Payment Method</p>
                <p className="font-medium">{order.paymentMethod || "bKash"}</p>
                <p className="text-xs text-muted-foreground capitalize">{order.paymentType?.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Shipping Address</p>
                <p>{order.firstName} {order.lastName}</p>
                <p className="text-xs text-muted-foreground">
                  {order.address}, {order.city}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button asChild>
              <a href="/shop">Continue Shopping</a>
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
