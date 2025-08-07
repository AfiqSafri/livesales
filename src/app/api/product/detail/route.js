import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { productId } = await req.json();
    
    if (!productId) {
      return new Response(JSON.stringify({ error: 'Product ID is required' }), { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            companyName: true,
            businessType: true,
            bio: true,
            phone: true,
            address: true,
            bankName: true,
            bankAccountNumber: true,
            bankAccountHolder: true,
            bankCode: true
          }
        },
        images: {
          select: {
            id: true,
            url: true
          }
        }
      }
    });

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ product }), { status: 200 });
  } catch (error) {
    console.error('Error fetching product details:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch product details' }), { status: 500 });
  }
} 