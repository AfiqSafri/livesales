import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { orderId, sellerId } = await req.json();

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
      return new Response(JSON.stringify({ error: 'Order not found or you do not have permission to delete this order' }), { status: 404 });
    }

    // Delete order and related records in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete order status history
      await tx.orderStatusHistory.deleteMany({
        where: { orderId: Number(orderId) }
      });

      // Delete notifications related to this order
      await tx.notification.deleteMany({
        where: { orderId: Number(orderId) }
      });

      // Delete the order itself
      await tx.order.delete({
        where: { id: Number(orderId) }
      });
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('Error deleting order:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}