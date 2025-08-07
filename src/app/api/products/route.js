import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        quantity: {
          gt: 0 // Only show products with stock
        }
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            companyName: true,
            businessType: true,
            bio: true
          }
        },
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
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch products' }), { status: 500 });
  }
} 