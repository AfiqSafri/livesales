import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { action } = await req.json();
    
    if (action === 'check_payments') {
      const payments = await prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { orders: true }
      });
      
      return new Response(JSON.stringify({ payments }), { status: 200 });
    }
    
    if (action === 'check_orders') {
      const orders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { payment: true, product: true }
      });
      
      return new Response(JSON.stringify({ orders }), { status: 200 });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
    
  } catch (error) {
    console.error('Debug error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 