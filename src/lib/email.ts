import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/verify?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Roselyra" <noreply@roselyra.com>',
    to: email,
    subject: "Verify your email - Roselyra",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to Roselyra</h1>
            <p>Thank you for registering! Please verify your email address to continue.</p>
            <p style="margin: 24px 0;">
              <a href="${verifyUrl}" class="button">Verify Email</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${verifyUrl}</p>
            <p>This link expires in 24 hours.</p>
            <div class="footer">
              <p>If you didn't create an account, please ignore this email.</p>
              <p>© 2026 Roselyra. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendOrderConfirmationEmail(order: any, settings: any) {
  const orderUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/order/${order.orderNumber}`;
  
  const itemsHtml = order.items.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        ${item.product?.name || "Product"}<br>
        <small style="color: #666;">${item.color ? `Color: ${item.color}` : ""} ${item.size ? `, Size: ${item.size}` : ""}</small>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join("");

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"${settings?.storeName || "Roselyra"}" <noreply@roselyra.com>`,
    to: order.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f9f9f9; padding: 12px; text-align: left; }
            .total-row { font-weight: bold; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Order Confirmed!</h1>
            <p>Thank you for your order. Your order has been confirmed and is being processed.</p>
            
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            
            <table>
              <thead>
                <tr>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #000;">Product</th>
                  <th style="padding: 12px; border-bottom: 2px solid #000;">Qty</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #000;">Price</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #000;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 12px; text-align: right;">Subtotal</td>
                  <td style="padding: 12px; text-align: right;">$${order.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 12px; text-align: right;">Shipping</td>
                  <td style="padding: 12px; text-align: right;">$${order.shippingCost.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 12px; text-align: right;">Tax</td>
                  <td style="padding: 12px; text-align: right;">$${order.tax.toFixed(2)}</td>
                </tr>
                ${order.discount > 0 ? `
                <tr>
                  <td colspan="3" style="padding: 12px; text-align: right;">Discount</td>
                  <td style="padding: 12px; text-align: right;">-$${order.discount.toFixed(2)}</td>
                </tr>
                ` : ""}
                <tr class="total-row">
                  <td colspan="3" style="padding: 12px; text-align: right;">Total</td>
                  <td style="padding: 12px; text-align: right;">$${(order.subtotal + order.shippingCost + order.tax - order.discount).toFixed(2)}</td>
                </tr>
                ${order.paidAmount > 0 ? `
                <tr>
                  <td colspan="3" style="padding: 12px; text-align: right;">Paid</td>
                  <td style="padding: 12px; text-align: right;">-$${order.paidAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 12px; text-align: right;">Due</td>
                  <td style="padding: 12px; text-align: right;">$${order.dueAmount.toFixed(2)}</td>
                </tr>
                ` : ""}
              </tfoot>
            </table>
            
            <h3>Shipping Address</h3>
            <p>
              ${order.firstName} ${order.lastName}<br>
              ${order.address}<br>
              ${order.city}, ${order.state} ${order.postalCode}<br>
              ${order.country}
            </p>
            
            ${order.phone ? `<p><strong>Phone:</strong> ${order.phone}</p>` : ""}
            
            <div class="footer">
              <p>${settings?.storeName || "Roselyra"}</p>
              <p>${settings?.storeEmail || ""}</p>
              <p>${settings?.storePhone || ""}</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendPaymentReceivedEmail(order: any, settings: any) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"${settings?.storeName || "Roselyra"}" <noreply@roselyra.com>`,
    to: order.email,
    subject: `Payment Received - Order ${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Payment Received!</h1>
          <p>Thank you! We have received your payment for order ${order.orderNumber}.</p>
          <p><strong>Paid Amount:</strong> $${order.paidAmount.toFixed(2)}</p>
          <p><strong>Due Amount:</strong> $${order.dueAmount.toFixed(2)}</p>
          <p>Your order is now being processed.</p>
        </body>
      </html>
    `,
  });
}
