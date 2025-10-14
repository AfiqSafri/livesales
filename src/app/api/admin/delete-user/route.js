import { prisma } from '@/lib/prisma';

export async function DELETE(req) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Prevent deletion of admin accounts
    if (user.userType === 'admin') {
      return new Response(JSON.stringify({ error: 'Cannot delete admin accounts' }), { status: 403 });
    }

    const id = Number(userId);

    await prisma.$transaction(async (tx) => {
      // If seller, clean up product-related data in safe order
      if (user.userType === 'seller') {
        const products = await tx.product.findMany({ where: { sellerId: id }, select: { id: true } });
        const productIds = products.map(p => p.id);

        if (productIds.length > 0) {
          // Delete product images
          await tx.productImage.deleteMany({ where: { productId: { in: productIds } } });

          // Collect orders for these products
          const sellerOrders = await tx.order.findMany({ where: { productId: { in: productIds } }, select: { id: true } });
          const sellerOrderIds = sellerOrders.map(o => o.id);

          if (sellerOrderIds.length > 0) {
            // Delete order-related records first
            await tx.orderStatusHistory.deleteMany({ where: { orderId: { in: sellerOrderIds } } });
            await tx.payout.deleteMany({ where: { orderId: { in: sellerOrderIds } } });
            await tx.notification.deleteMany({ where: { orderId: { in: sellerOrderIds } } });
            await tx.receipt.deleteMany({ where: { orderId: { in: sellerOrderIds } } });
            // Delete orders
            await tx.order.deleteMany({ where: { id: { in: sellerOrderIds } } });
          }

          // Delete products
          await tx.product.deleteMany({ where: { id: { in: productIds } } });
        }
      }

      // Buyer orders cleanup (if deleting a buyer account)
      const buyerOrders = await tx.order.findMany({ where: { buyerId: id }, select: { id: true } });
      const buyerOrderIds = buyerOrders.map(o => o.id);
      if (buyerOrderIds.length > 0) {
        await tx.orderStatusHistory.deleteMany({ where: { orderId: { in: buyerOrderIds } } });
        await tx.payout.deleteMany({ where: { orderId: { in: buyerOrderIds } } });
        await tx.notification.deleteMany({ where: { orderId: { in: buyerOrderIds } } });
        await tx.receipt.deleteMany({ where: { orderId: { in: buyerOrderIds } } });
        await tx.order.deleteMany({ where: { id: { in: buyerOrderIds } } });
      }

      // Delete receipts where user is seller or buyer
      await tx.receipt.deleteMany({ where: { OR: [{ sellerId: id }, { buyerId: id }] } });

      // Delete notifications addressed to the user
      await tx.notification.deleteMany({ where: { userId: id } });

      // Delete payouts for this seller (if any left)
      await tx.payout.deleteMany({ where: { sellerId: id } });

      // Delete payments made by the user
      await tx.payment.deleteMany({ where: { userId: id } });

      // Finally delete the user
      await tx.user.delete({ where: { id } });
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'User deleted successfully'
    }), { status: 200 });

  } catch (error) {
    console.error('Error deleting user:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete user' }), { status: 500 });
  }
} 