import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '../../../../../utils/email.js';

export async function POST(req) {
  try {
    const { orderId, sellerId, status, trackingNumber, courierName, estimatedDelivery, sellerNotes } = await req.json();

    if (!orderId || !sellerId || !status) {
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

    // Validate status
    const validStatuses = ['pending', 'processing', 'ready_to_ship', 'shipped', 'out_for_delivery', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400 });
    }

    // Update order
    const updateData = {
      status,
      ...(trackingNumber && { trackingNumber }),
      ...(courierName && { courierName }),
      ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }),
      ...(sellerNotes && { sellerNotes })
    };

    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: updateData,
    });

    // Add status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: Number(orderId),
        status,
        description: `Order status updated to ${status}`,
        updatedBy: 'seller'
      }
    });

    // Send email notification to buyer if email exists
    if (order.buyerEmail) {
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
          trackingNumber: trackingNumber,
          courierName: courierName,
          sellerNotes: sellerNotes,
          estimatedDelivery: estimatedDelivery
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
        console.error('❌ Error sending status update email:', emailError);
      }
    } else {
      console.log('⚠️ No buyer email found for order:', orderId);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      order: updatedOrder 
    }), { status: 200 });

  } catch (error) {
    console.error('Error updating order status:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 