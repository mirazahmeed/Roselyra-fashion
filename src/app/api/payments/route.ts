import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/apiHelpers";
import { requireEditor } from "@/lib/apiMiddleware";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, method, senderNumber, transactionId, amount } = body;

    if (!orderId || !method || !amount) {
      return errorResponse("Order ID, method, and amount are required", 400);
    }

    const order = db.orders.find(o => o.id === orderId);
    if (!order) {
      return errorResponse("Order not found", 404);
    }

    // Validate minimum advance amount
    const settings = db.getSettings();
    if (method === "BKASH") {
      if (amount < settings.minAdvanceAmount) {
        return errorResponse(`Minimum advance amount is ${settings.minAdvanceAmount}`, 400);
      }
    }

    // Create payment record
    const payment = db.createPayment({
      orderId,
      method,
      senderNumber,
      transactionId,
      amount,
    });

    // Send email notification
    try {
      const { sendPaymentReceivedEmail } = await import("@/lib/email");
      await sendPaymentReceivedEmail(order, settings);
    } catch (emailError) {
      console.error("Failed to send payment email:", emailError);
    }

    return successResponse({ payment, order: { ...order, status: order.status } });
  } catch (err) {
    console.error("[CREATE_PAYMENT]", err);
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  const authError = requireEditor(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { paymentId, status, adminNotes } = body;

    if (!paymentId || !status) {
      return errorResponse("Payment ID and status are required", 400);
    }

    const payment = db.updatePaymentStatus(paymentId, status, adminNotes);
    if (!payment) {
      return errorResponse("Payment not found", 404);
    }

    // Send confirmation email if approved
    if (status === "APPROVED") {
      const order = db.orders.find(o => o.id === payment.orderId);
      if (order) {
        const settings = db.getSettings();
        try {
          const { sendOrderConfirmationEmail } = await import("@/lib/email");
          await sendOrderConfirmationEmail(order, settings);
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
        }
      }
    }

    return successResponse({ payment });
  } catch (err) {
    console.error("[UPDATE_PAYMENT]", err);
    return errorResponse("Internal server error", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (orderId) {
      const payment = db.getPaymentByOrderId(orderId);
      if (!payment) {
        return errorResponse("Payment not found", 404);
      }
      return successResponse(payment);
    }

    return errorResponse("Order ID is required", 400);
  } catch (err) {
    console.error("[GET_PAYMENT]", err);
    return errorResponse("Internal server error", 500);
  }
}
