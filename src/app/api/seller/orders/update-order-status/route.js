import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        await fetch(`${baseUrl}/api/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: order.buyerEmail,
            subject: `Order Status Updated - ${status.toUpperCase()}`,
            html: `
              <h2>Order Status Updated</h2>
              <p>Your order #${orderId} status has been updated to: <strong>${status.toUpperCase()}</strong></p>
              ${trackingNumber ? `<p>Tracking Number: ${trackingNumber}</p>` : ''}
              ${courierName ? `<p>Courier: ${courierName}</p>` : ''}
              ${sellerNotes ? `<p>Seller Notes: ${sellerNotes}</p>` : ''}
              <p>Thank you for your purchase!</p>
            `,
            text: `Order Status Updated - Your order #${orderId} status has been updated to: ${status.toUpperCase()}`
          })
        });
      } catch (emailError) {
        console.error('Error sending status update email:', emailError);
      }
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