import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { sellerId } = await req.json();
    if (!sellerId) {
      return new Response(JSON.stringify({ error: 'Missing sellerId' }), { status: 400 });
    }
    const products = await prisma.product.findMany({ 
      where: { sellerId },
      include: { images: true, },
    });
    return new Response(JSON.stringify({ products }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 