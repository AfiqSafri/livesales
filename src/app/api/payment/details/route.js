import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { reference } = await req.json();
    
    if (!reference) {
      return new Response(JSON.stringify({ error: 'Reference is required' }), { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { reference: reference }
    });

    if (!payment) {
      return new Response(JSON.stringify({ error: 'Payment not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ payment }), { status: 200 });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 