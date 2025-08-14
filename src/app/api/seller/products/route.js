import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { sellerId, userId } = await req.json();
    const id = sellerId || userId;
    
    if (!id) {
      return new Response(JSON.stringify({ 
        error: 'Missing sellerId or userId',
        details: 'Seller ID is required to fetch products'
      }), { status: 400 });
    }
    
    const products = await prisma.product.findMany({ 
      where: { sellerId: Number(id) },
      include: { 
        productImages: {
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
  } catch (error) {
    console.error('Error fetching seller products:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: 'An unexpected error occurred while fetching products'
    }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 