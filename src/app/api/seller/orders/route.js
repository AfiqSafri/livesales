import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { sellerId } = await req.json();
    if (!sellerId) {
      return new Response(JSON.stringify({ error: 'Missing sellerId' }), { status: 400 });
    }
    // Find all orders for products belonging to this seller
    const orders = await prisma.order.findMany({
      where: {
        product: {
          sellerId: Number(sellerId)
        }
      },
      include: {
        product: true,
        buyer: true
      }
    });
    return new Response(JSON.stringify({ orders }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 