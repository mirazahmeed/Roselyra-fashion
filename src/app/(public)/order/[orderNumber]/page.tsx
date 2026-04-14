"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PageTransition } from "@/components/animations/PageTransition";
import { Loader2, CheckCircle, Clock, Package, Truck, XCircle, CreditCard, Phone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

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
  const { user, accessToken } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState({
    senderNumber: "",
    transactionId: "",
    amount: "",
  });

  useEffect(() => {
    if (orderNumber) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  const fetchData = () => {
    if (!orderNumber) return;
    Promise.all([
      fetch(`/api/orders?orderNumber=${orderNumber}`).then((res) => res.json()),
      fetch(`/api/payments?orderNumber=${orderNumber}`).then((res) => res.json()),
    ])
      .then(([orderData, paymentData]) => {
        if (orderData.success) {
          setOrder(orderData.data);
          const total = (orderData.data.subtotal || 0) + (orderData.data.shippingCost || 0) + (orderData.data.tax || 0) - (orderData.data.discount || 0);
          const paidAmount = orderData.data.paidAmount || 0;
          setPaymentData({
            senderNumber: "",
            transactionId: "",
            amount: (total - paidAmount).toString(),
          });
        }
        if (paymentData.success && paymentData.data) {
          setPayment(paymentData.data);
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [orderNumber]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast.error("Please login to submit payment");
      return;
    }
    if (!paymentData.senderNumber || !paymentData.transactionId || !paymentData.amount) {
      toast.error("Please fill in all payment details");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          method: "BKASH",
          senderNumber: paymentData.senderNumber,
          transactionId: paymentData.transactionId,
          amount: parseFloat(paymentData.amount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment submitted successfully!");
        setShowPaymentForm(false);
        
        const updatedOrder = { ...order, status: "PAYMENT_SUBMITTED" };
        setOrder(updatedOrder);
        
        if (orderNumber) {
          fetch(`/api/payments?orderNumber=${orderNumber}`)
            .then((res) => res.json())
            .then((paymentData) => {
              if (paymentData.success && paymentData.data) {
                setPayment(paymentData.data);
              }
            });
        }
      } else {
        toast.error(data.error || "Failed to submit payment");
      }
    } catch (err) {
      toast.error("Failed to submit payment");
    } finally {
      setSubmitting(false);
    }
  };

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
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              Order #{order.orderNumber} has been placed successfully.
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1 hover:bg-muted rounded-full transition-colors"
                title="Refresh order status"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
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

          <div className="bg-white border rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-display uppercase tracking-wider">Payment Information</h2>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-400">
                  Status: {payment?.status?.toUpperCase() || "NO_PAYMENT"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (orderNumber) {
                      fetch(`/api/payments?orderNumber=${orderNumber}`)
                        .then((res) => res.json())
                        .then((data) => {
                          if (data.success && data.data) {
                            setPayment(data.data);
                          } else {
                            setPayment(null);
                          }
                        });
                    }
                  }}
                >
                  Refresh
                </Button>
              </div>
            </div>

            {showPaymentForm ? (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="senderNumber">bKash Sender Number</Label>
                  <Input
                    id="senderNumber"
                    placeholder="01XXXXXXXXX"
                    value={paymentData.senderNumber}
                    onChange={(e) => setPaymentData({ ...paymentData, senderNumber: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input
                    id="transactionId"
                    placeholder="XXXXXXXXXXXX"
                    value={paymentData.transactionId}
                    onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (৳)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Payment"
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowPaymentForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const paymentStatus = payment?.status?.toUpperCase() as string | undefined;
                    const hasPayment = !!payment;
                    const dueAmount = (order.subtotal || 0) + (order.shippingCost || 0) + (order.tax || 0) - (order.discount || 0) - (order.paidAmount || 0);

                    // ── CASE 1: No payment submitted yet ─────────────────────
                    if (!hasPayment) {
                      return (
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center gap-2 text-orange-600 mb-2">
                            <CreditCard className="w-5 h-5" />
                            <span className="font-medium">Payment Required</span>
                          </div>
                          <p className="text-sm text-orange-600 mb-1">
                            Your order is pending payment. Please send the full amount via bKash and submit your transaction details.
                          </p>
                          <p className="text-sm font-bold text-orange-700 mb-4">
                            Total Due: ৳{dueAmount.toFixed(2)}
                          </p>
                          <Button
                            onClick={() => setShowPaymentForm(true)}
                            className="w-full bg-orange-600 hover:bg-orange-700"
                          >
                            Pay Now
                          </Button>
                        </div>
                      );
                    }

                    // ── CASE 2: Payment submitted, awaiting admin review ──────
                    if (paymentStatus === "PENDING") {
                      return (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-700 mb-2">
                            <Clock className="w-5 h-5" />
                            <span className="font-medium">Awaiting Verification</span>
                          </div>
                          <p className="text-sm text-yellow-700 mb-1">
                            Your payment of <strong>৳{payment.amount.toFixed(2)}</strong> has been received and is under review. We'll confirm it shortly.
                          </p>
                          {payment.transactionId && (
                            <p className="text-xs text-yellow-600 mb-4">Transaction ID: {payment.transactionId}</p>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => setShowPaymentForm(true)}
                            className="w-full border-yellow-400 text-yellow-700 hover:bg-yellow-100"
                          >
                            Update Payment Details
                          </Button>
                        </div>
                      );
                    }

                    // ── CASE 3: Payment rejected by admin ─────────────────────
                    if (paymentStatus === "REJECTED") {
                      return (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 text-red-600 mb-2">
                            <XCircle className="w-5 h-5" />
                            <span className="font-medium">Payment Rejected</span>
                          </div>
                          <p className="text-sm text-red-600 mb-2">
                            Your payment information was incorrect or could not be verified. Please re-submit with correct details.
                          </p>
                          {payment.adminNotes && (
                            <p className="text-xs bg-red-100 text-red-700 rounded p-2 mb-4">
                              <strong>Admin note:</strong> {payment.adminNotes}
                            </p>
                          )}
                          <p className="text-sm font-bold text-red-700 mb-4">
                            Amount Due: ৳{dueAmount.toFixed(2)}
                          </p>
                          <Button
                            onClick={() => setShowPaymentForm(true)}
                            className="w-full bg-red-600 hover:bg-red-700"
                          >
                            Re-submit Payment
                          </Button>
                        </div>
                      );
                    }

                    // ── CASE 4a: Payment approved — fully paid ────────────────
                    if (paymentStatus === "APPROVED" && dueAmount <= 0) {
                      return (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-600 mb-2">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Payment Complete</span>
                          </div>
                          <p className="text-sm text-green-600">
                            Your payment of <strong>৳{payment.amount.toFixed(2)}</strong> has been verified. Your order is confirmed!
                          </p>
                        </div>
                      );
                    }

                    // ── CASE 4b: Payment approved — partial (due amount remains) ─
                    if (paymentStatus === "APPROVED" && dueAmount > 0) {
                      return (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Advance Payment Verified</span>
                          </div>
                          <p className="text-sm text-blue-600 mb-1">
                            Payment of <strong>৳{payment.amount.toFixed(2)}</strong> has been confirmed.
                          </p>
                          <p className="text-sm font-bold text-blue-700 mb-4">
                            Remaining Balance: ৳{dueAmount.toFixed(2)}
                          </p>
                          <Button
                            onClick={() => setShowPaymentForm(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            Pay Remaining Balance
                          </Button>
                        </div>
                      );
                    }

                    // ── FALLBACK: Unknown state ────────────────────────────────
                    return (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-4">
                          Payment status: {paymentStatus || "Unknown"}
                        </p>
                        <Button
                          onClick={() => setShowPaymentForm(true)}
                          className="w-full"
                        >
                          Submit Payment
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              )}
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
