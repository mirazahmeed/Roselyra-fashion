"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/authToken";
import { Search, Loader2, Eye, Package, Truck, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Order, OrderStatus, Payment, PaymentStatus } from "@/types";
import toast from "react-hot-toast";
import Image from "next/image";

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  PAYMENT_SUBMITTED: { label: "Payment Submitted", color: "bg-orange-100 text-orange-800", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  PROCESSING: { label: "Processing", color: "bg-purple-100 text-purple-800", icon: Package },
  SHIPPED: { label: "Shipped", color: "bg-indigo-100 text-indigo-800", icon: Truck },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
  REFUNDED: { label: "Refunded", color: "bg-gray-100 text-gray-800", icon: XCircle },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setOrders(json.data.items || []);
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchPayment = async (orderId: string) => {
    setIsLoadingPayment(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/payments?orderId=${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setPayment(json.data);
      } else {
        setPayment(null);
      }
    } catch (error) {
      setPayment(null);
    } finally {
      setIsLoadingPayment(false);
    }
  };

  useEffect(() => {
    if (selectedOrder) {
      fetchPayment(selectedOrder.id);
    } else {
      setPayment(null);
    }
  }, [selectedOrder]);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success("Order status updated");
        fetchOrders();
        setSelectedOrder(null);
      } else {
        toast.error("Failed to update order");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Order deleted");
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
      } else {
        toast.error("Failed to delete order");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const updatePaymentStatus = async (status: PaymentStatus) => {
    if (!payment) return;
    try {
      const token = getAuthToken();
      const res = await fetch("/api/payments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentId: payment.id, status }),
      });

      if (res.ok) {
        toast.success(`Payment ${status.toLowerCase()}`);
        fetchPayment(selectedOrder!.id);
        fetchOrders();
      } else {
        toast.error("Failed to update payment");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      `${o.firstName} ${o.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-widest">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage customer orders.
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-lg">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by order #, email, name..."
              className="pl-9 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground ml-auto">
            {filteredOrders.length} order(s)
          </div>
        </div>

        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground font-medium">
              <tr className="border-b">
                <th className="h-12 px-4 align-middle">Order</th>
                <th className="h-12 px-4 align-middle">Customer</th>
                <th className="h-12 px-4 align-middle">Status</th>
                <th className="h-12 px-4 align-middle">Items</th>
                <th className="h-12 px-4 align-middle text-right">Total</th>
                <th className="h-12 px-4 align-middle">Date</th>
                <th className="h-12 px-4 align-middle w-[80px]"></th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const StatusIcon = statusConfig[order.status].icon;
                  return (
                    <tr key={order.id} className="border-b transition-colors hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                      <td className="p-4 align-middle font-medium">
                        {order.orderNumber}
                      </td>
                      <td className="p-4 align-middle">
                        <div>{order.firstName} {order.lastName}</div>
                        <div className="text-xs text-muted-foreground">{order.email}</div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusConfig[order.status].color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[order.status].label}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        {order.items?.length || 0} item(s)
                      </td>
                      <td className="p-4 align-middle text-right font-medium">
                        ${(order.subtotal + order.shippingCost + order.tax - order.discount).toFixed(2)}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => { e.stopPropagation(); deleteOrder(order.id); }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-wider">
              Order {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${statusConfig[selectedOrder.status].color}`}>
                    {statusConfig[selectedOrder.status].label}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wider mb-3">Shipping Address</h3>
                  <div className="text-sm space-y-1">
                    <p>{selectedOrder.firstName} {selectedOrder.lastName}</p>
                    <p>{selectedOrder.address}</p>
                    <p>{selectedOrder.city}, {selectedOrder.state} {selectedOrder.postalCode}</p>
                    <p>{selectedOrder.country}</p>
                    <p className="text-muted-foreground">{selectedOrder.email}</p>
                    {selectedOrder.phone && <p>{selectedOrder.phone}</p>}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wider mb-3">Order Summary</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>${selectedOrder.shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${selectedOrder.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Total</span>
                      <span>${(selectedOrder.subtotal + selectedOrder.shippingCost + selectedOrder.tax - selectedOrder.discount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider mb-3">Payment Information</h3>
                {isLoadingPayment ? (
                  <div className="text-sm text-muted-foreground">Loading payment info...</div>
                ) : payment ? (
                  <div className="bg-muted/30 rounded-md p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Method</span>
                        <p className="font-medium">{payment.method}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount</span>
                        <p className="font-medium">${payment.amount.toFixed(2)}</p>
                      </div>
                      {payment.senderNumber && (
                        <div>
                          <span className="text-muted-foreground">Sender Number</span>
                          <p className="font-medium">{payment.senderNumber}</p>
                        </div>
                      )}
                      {payment.transactionId && (
                        <div>
                          <span className="text-muted-foreground">Transaction ID</span>
                          <p className="font-medium">{payment.transactionId}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Status</span>
                        <p className={`font-medium ${
                          payment.status === "APPROVED" ? "text-green-600" :
                          payment.status === "REJECTED" ? "text-red-600" :
                          "text-yellow-600"
                        }`}>
                          {payment.status}
                        </p>
                      </div>
                    </div>
                    {payment.status === "PENDING" && (
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => updatePaymentStatus("APPROVED")}
                        >
                          Approve Payment
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updatePaymentStatus("REJECTED")}
                        >
                          Reject Payment
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No payment record found</div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider mb-3">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-md">
                      <div className="w-16 h-20 relative bg-muted rounded overflow-hidden flex-shrink-0">
                        {item.product?.images?.[0] ? (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product?.name || "Product"}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                          {item.size && ` | Size: ${item.size}`}
                          {item.color && ` | Color: ${item.color}`}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <Button
                      key={status}
                      variant={selectedOrder.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateOrderStatus(selectedOrder.id, status as OrderStatus)}
                      disabled={selectedOrder.status === status}
                    >
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
