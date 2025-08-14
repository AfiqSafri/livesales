import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function DELETE(req) {
  try {
    const body = await req.json();
    console.log('Delete product request body:', body);
    
    const { productId, sellerId, userId } = body;
    const id = sellerId || userId;
    
    console.log('Parsed values:', { productId, sellerId, userId, id });
    
    if (!productId || !id) {
      console.log('Missing fields:', { productId: !!productId, id: !!id });
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        details: 'Product ID and Seller ID are required'
      }), { status: 400 });
    }
    
    // Ensure the product belongs to the seller
    const product = await prisma.product.findFirst({ 
      where: { 
        id: Number(productId),
        sellerId: Number(id)
      },
      include: {
        productImages: true,
        orders: true
      }
    });
    
    if (!product) {
      return new Response(JSON.stringify({ 
        error: 'Product not found or unauthorized',
        details: 'You do not have permission to delete this product'
      }), { status: 404 });
    }
    
    console.log('Product found:', product);
    
    // Delete all related records first
    if (product.productImages && product.productImages.length > 0) {
      await prisma.productImage.deleteMany({ 
        where: { productId: Number(productId) } 
      });
      console.log('Product images deleted');
    }
    
    if (product.orders && product.orders.length > 0) {
      await prisma.order.deleteMany({ 
        where: { productId: Number(productId) } 
      });
      console.log('Product orders deleted');
    }
    
    // Then delete the product
    await prisma.product.delete({ 
      where: { id: Number(productId) } 
    });
    
    console.log('Product deleted successfully');
    
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
    await prisma.$disconnect();
  }
} 