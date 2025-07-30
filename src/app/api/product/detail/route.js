import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { productId } = await req.json();
    if (!productId) {
      return new Response(JSON.stringify({ error: 'Missing productId' }), { status: 400 });
    }
    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }
    const seller = await prisma.user.findUnique({ where: { id: product.sellerId } });
    const { password: _pw, ...sellerNoPw } = seller || {};
    const images = await prisma.productImage.findMany({ where: { productId: product.id } });
    return new Response(
      JSON.stringify({ product, seller: sellerNoPw, images }),
      { status: 200 }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 