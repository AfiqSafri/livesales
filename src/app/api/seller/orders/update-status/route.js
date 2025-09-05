import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '../../../../../utils/email.js';

async function sendPaymentEmail(to, status) {
  let subject, html, text;
  if (status === 'paid') {
    subject = 'Payment Approved';
    html = '<p>Your payment has been approved! Your order is being processed.</p>';
    text = 'Your payment has been approved! Your order is being processed.';
  } else if (status === 'failed') {
    subject = 'Payment Rejected';
    html = '<p>Your payment was rejected. Please upload a valid receipt or contact support.</p>';
    text = 'Your payment was rejected. Please upload a valid receipt or contact support.';
  } else {
    return;
  }
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  await fetch(`${baseUrl}/api/email/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html, text })
  });
}

export async function POST(req) {
  try {
    const { orderId, status, sellerId, paymentStatus, clearReceipt } = await req.json();
    if (!orderId || !sellerId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Check if order exists and belongs to this seller
    const order = await prisma.order.findFirst({
      where: { 
        id: Number(orderId),
        product: {
          sellerId: Number(sellerId)
        }
      }
    });

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found or you do not have permission to update this order' }), { status: 404 });
    }

    // Build update data
    const updateData = {};
    if (status) {
      // Validate status
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400 });
      }
      updateData.status = status;
    }
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    if (clearReceipt) {
      updateData.receiptUrl = null;
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: updateData,
    });

    // Create status history entry for the update
    if (status || paymentStatus) {
      let description = '';
      if (status) {
        const statusDescriptions = {
          'pending': 'Order is pending payment confirmation',
          'processing': 'Order is being processed and prepared for shipping',
          'shipped': 'Order has been shipped and is on its way',
          'delivered': 'Order has been delivered successfully',
          'cancelled': 'Order has been cancelled'
        };
        description = statusDescriptions[status] || `Order status updated to ${status}`;
      } else if (paymentStatus) {
        const paymentDescriptions = {
          'paid': 'Payment has been confirmed and received',
          'failed': 'Payment was unsuccessful or rejected',
          'refunded': 'Payment has been refunded'
        };
        description = paymentDescriptions[paymentStatus] || `Payment status updated to ${paymentStatus}`;
      }

      await prisma.orderStatusHistory.create({
        data: {
          orderId: Number(orderId),
          status: status || paymentStatus,
          description: description,
          location: 'Seller Dashboard',
          updatedBy: 'seller'
        }
      });
    }

    // Send email notification if payment status changed
    if (paymentStatus && (paymentStatus === 'paid' || paymentStatus === 'failed') && order.buyerEmail) {
      await sendPaymentEmail(order.buyerEmail, paymentStatus);
    }

    // Send email notification if shipping status changed
    if (status && order.buyerEmail) {
      try {
        console.log('📧 Sending shipping status update email to:', order.buyerEmail);
        
        // Get product name for the email
        const orderWithProduct = await prisma.order.findUnique({
          where: { id: Number(orderId) },
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        });

        const emailTemplate = emailTemplates.shippingStatusUpdate({
          buyerName: order.buyerName || 'Customer',
          orderId: orderId,
          productName: orderWithProduct?.product?.name || 'Product',
          status: status,
          trackingNumber: order.trackingNumber,
          courierName: order.courierName,
          sellerNotes: order.sellerNotes,
          estimatedDelivery: order.estimatedDelivery
        });

        const emailResult = await sendEmail({
          to: order.buyerEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        });

        if (emailResult.success) {
          console.log('✅ Shipping status update email sent successfully');
        } else {
          console.log('❌ Failed to send shipping status update email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('❌ Error sending shipping status update email:', emailError);
      }
    }

    return new Response(JSON.stringify({ success: true, order: updatedOrder }), { status: 200 });
  } catch (e) {
    console.error('Error updating order status:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 