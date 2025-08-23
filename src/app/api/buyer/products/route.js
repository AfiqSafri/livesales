import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return new Response(JSON.stringify({ products }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 