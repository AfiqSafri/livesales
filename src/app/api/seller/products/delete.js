import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { productId, sellerId } = await req.json();
    if (!productId || !sellerId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }
    // Ensure the product belongs to the seller
    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product || product.sellerId !== Number(sellerId)) {
      return new Response(JSON.stringify({ error: 'Product not found or unauthorized' }), { status: 404 });
    }
    // Delete all related orders first
    await prisma.order.deleteMany({ where: { productId: Number(productId) } });
    // Then delete the product
    await prisma.product.delete({ where: { id: Number(productId) } });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 