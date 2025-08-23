import { PrismaClient } from '@prisma/client';

// Create a single Prisma instance with better connection handling
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable to prevent multiple instances
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.prisma;
}

export async function POST(req) {
  try {
    const { productId, sellerId } = await req.json();
    
    if (!productId || !sellerId) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        details: 'Product ID and Seller ID are required'
      }), { status: 400 });
    }
    
    // Ensure the product belongs to the seller
    const product = await prisma.product.findFirst({ 
      where: { 
        id: Number(productId),
        sellerId: Number(sellerId)
      },
      include: {
        images: true,
        orders: true
      }
    });
    
    if (!product) {
      return new Response(JSON.stringify({ 
        error: 'Product not found or unauthorized',
        details: 'You do not have permission to delete this product'
      }), { status: 404 });
    }
    
    // Delete all related records first in the correct order
    // 1. Delete notifications related to orders
    if (product.orders && product.orders.length > 0) {
      for (const order of product.orders) {
        await prisma.notification.deleteMany({
          where: { orderId: order.id }
        });
      }
    }
    
    // 2. Delete order status history
    if (product.orders && product.orders.length > 0) {
      for (const order of product.orders) {
        await prisma.orderStatusHistory.deleteMany({
          where: { orderId: order.id }
        });
      }
    }
    
    // 3. Delete orders
    if (product.orders && product.orders.length > 0) {
      await prisma.order.deleteMany({ 
        where: { productId: Number(productId) } 
      });
    }
    
    // 4. Delete product images
    if (product.images && product.images.length > 0) {
      await prisma.productImage.deleteMany({ 
        where: { productId: Number(productId) } 
      });
    }
    
    // 5. Finally delete the product
    await prisma.product.delete({ 
      where: { id: Number(productId) } 
    });
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Product deleted successfully'
    }), { status: 200 });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    
    // Provide more specific error messages
    if (error.code === 'P2003') {
      return new Response(JSON.stringify({ 
        error: 'Cannot delete product',
        details: 'This product has active orders and cannot be deleted'
      }), { status: 400 });
    }
    
    if (error.code === 'P2025') {
      return new Response(JSON.stringify({ 
        error: 'Product not found',
        details: 'The product you are trying to delete does not exist'
      }), { status: 404 });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: 'An unexpected error occurred while deleting the product'
    }), { status: 500 });
  } finally {
    // Don't disconnect to maintain connection pooling
    // The connection will be managed by Prisma automatically
  }
} 