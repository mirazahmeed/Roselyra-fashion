import { NextRequest } from "next/server";
import { mongo as db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { requireEditor, requireAuth } from "@/lib/apiMiddleware";

export async function POST(req: NextRequest) {
  try {
    const authError = requireAuth(req);
    if (authError) return authError;

    const body = await req.json();
    const { orderId, method, senderNumber, transactionId, amount } = body;

    if (!orderId || !method || !amount) {
      return errorResponse("Order ID, method, and amount are required", 400);
    }

    const order = await db.getOrderById(orderId);
    if (!order) {
      return errorResponse("Order not found", 404);
    }

    const settings = await db.getSettings();
    if (method === "BKASH") {
      if (amount < settings.minAdvanceAmount) {
        return errorResponse(`Minimum advance amount is ${settings.minAdvanceAmount}`, 400);
      }
    }

    const payment = await db.createPayment({
      orderId,
      method,
      senderNumber,
      transactionId,
      amount,
    });

    return successResponse({ payment, order: { ...order, status: order.status } });
  } catch (err) {
    console.error("[CREATE_PAYMENT]", err);
    return errorResponse("Internal server error", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const orderNumber = searchParams.get("orderNumber");

    const ordersResult = await db.getOrders({ perPage: 100 });
    let order = null;
    
    if (orderId) {
      order = ordersResult.items.find(o => o.id === orderId);
    } else if (orderNumber) {
      order = ordersResult.items.find(o => o.orderNumber === orderNumber);
    }

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    const payment = await db.getPaymentByOrderId(order.id);
    return successResponse({ order, payment });
  } catch (err) {
    console.error("[GET_PAYMENT]", err);
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentId, status, adminNotes } = body;

    if (!paymentId || !status) {
      return errorResponse("Payment ID and status are required", 400);
    }

    const payment = await db.updatePaymentStatus(paymentId, status, adminNotes);
    if (!payment) {
      return errorResponse("Payment not found", 404);
    }

    return successResponse(payment);
  } catch (err) {
    console.error("[UPDATE_PAYMENT]", err);
    return errorResponse("Internal server error", 500);
  }
}