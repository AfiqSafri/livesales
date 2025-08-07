import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { sellerId, userId } = await req.json();
    const id = sellerId || userId;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing sellerId or userId' }), { status: 400 });
    }
    
    const products = await prisma.product.findMany({ 
      where: { sellerId: Number(id) },
      include: { 
        images: {
          select: {
            id: true,
            url: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return new Response(JSON.stringify({ products }), { status: 200 });
  } catch (e) {
    console.error('Error fetching seller products:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 