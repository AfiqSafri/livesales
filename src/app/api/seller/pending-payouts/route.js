import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { sellerId } = await req.json();
    
    if (!sellerId) {
      return new Response(JSON.stringify({ 
        error: 'Seller ID is required' 
      }), { status: 400 });
    }

    // Verify seller exists
    const seller = await prisma.user.findFirst({
      where: { 
        id: Number(sellerId),
        userType: 'seller'
      }
    });

    if (!seller) {
      return new Response(JSON.stringify({ 
        error: 'Seller not found or not authorized' 
      }), { status: 404 });
    }

    // Get paid orders that don't have payouts yet
    const pendingOrders = await prisma.order.findMany({
      where: {
        product: {
          sellerId: Number(sellerId)
        },
        paymentStatus: 'paid',
        status: { in: ['processing', 'shipped', 'delivered'] }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true
          }
        },
        payment: {
          select: {
            id: true,
            status: true,
            paidAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter out orders that already have payouts
    const ordersWithoutPayouts = [];
    
    for (const order of pendingOrders) {
      const existingPayout = await prisma.payout.findFirst({
        where: {
          orderId: order.id,
          status: { in: ['pending', 'processing', 'completed'] }
        }
      });

      if (!existingPayout) {
        ordersWithoutPayouts.push(order);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      orders: ordersWithoutPayouts,
      totalCount: ordersWithoutPayouts.length
    }), { status: 200 });

  } catch (error) {
    console.error('Error fetching pending payouts:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}




