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
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }
    
    // Ensure the product belongs to the seller
    const product = await prisma.product.findUnique({ 
      where: { id: Number(productId) } 
    });
    
    if (!product || product.sellerId !== Number(id)) {
      return new Response(JSON.stringify({ error: 'Product not found or unauthorized' }), { status: 404 });
    }
    
    // Delete all related records first
    await prisma.productImage.deleteMany({ 
      where: { productId: Number(productId) } 
    });
    
    await prisma.order.deleteMany({ 
      where: { productId: Number(productId) } 
    });
    
    // Then delete the product
    await prisma.product.delete({ 
      where: { id: Number(productId) } 
    });
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 