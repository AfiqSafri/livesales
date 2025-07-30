import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { orderId, status, description, location, updatedBy = 'system' } = await req.json();
    
    if (!orderId || !status) {
      return new Response(JSON.stringify({ error: 'Order ID and status are required' }), { status: 400 });
    }

    // Get the order with product and buyer details
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        product: {
          include: {
            seller: true
          }
        },
        buyer: true
      }
    });

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        status,
        updatedAt: new Date(),
        // Set delivery date if status is delivered
        ...(status === 'delivered' && { actualDelivery: new Date() }),
        // Set payment date if status is paid
        ...(status === 'paid' && { paymentDate: new Date() })
      }
    });

    // Create status history record
    await prisma.orderStatusHistory.create({
      data: {
        orderId: Number(orderId),
        status,
        description: description || getStatusDescription(status),
        location,
        updatedBy
      }
    });

    // Create notification for buyer
    if (order.buyerId) {
      await prisma.notification.create({
        data: {
          userId: order.buyerId,
          orderId: Number(orderId),
          type: 'order_update',
          title: `Order #${orderId} Status Updated`,
          message: `Your order "${order.product.name}" is now ${status.replace('_', ' ')}.`,
          isRead: false
        }
      });
    }

    // Create notification for seller
    if (order.product.sellerId) {
      await prisma.notification.create({
        data: {
          userId: order.product.sellerId,
          orderId: Number(orderId),
          type: 'order_update',
          title: `Order #${orderId} Status Updated`,
          message: `Order for "${order.product.name}" is now ${status.replace('_', ' ')}.`,
          isRead: false
        }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      order: updatedOrder,
      message: `Order status updated to ${status}`
    }), { status: 200 });

  } catch (error) {
    console.error('Error updating order status:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

function getStatusDescription(status) {
  const descriptions = {
    'pending': 'Order has been placed and is awaiting confirmation',
    'paid': 'Payment has been received and order is confirmed',
    'processing': 'Order is being prepared for shipping',
    'ready_to_ship': 'Order is packed and ready for pickup by courier',
    'shipped': 'Order has been picked up by courier and is in transit',
    'out_for_delivery': 'Order is out for delivery to your address',
    'delivered': 'Order has been successfully delivered',
    'completed': 'Order has been completed successfully',
    'cancelled': 'Order has been cancelled',
    'returned': 'Order has been returned'
  };
  
  return descriptions[status] || `Order status changed to ${status}`;
} 