import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      products: products.map(product => ({
        ...product,
        price: parseFloat(product.price),
        shippingPrice: parseFloat(product.shippingPrice || 0),
      })),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 