import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { sellerId, userId } = await req.json();
    const id = sellerId || userId;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing sellerId or userId' }), { status: 400 });
    }
    
    // Find all orders for products belonging to this seller
    const orders = await prisma.order.findMany({
      where: {
        product: {
          sellerId: Number(id)
        }
      },
      include: {
        product: true,
        buyer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return new Response(JSON.stringify({ orders }), { status: 200 });
  } catch (e) {
    console.error('Error fetching seller orders:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 