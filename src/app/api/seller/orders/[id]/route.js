import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const { id } = params;
    
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        product: {
          include: {
            seller: true,
            images: true
          }
        },
        buyer: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ order }), { status: 200 });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 