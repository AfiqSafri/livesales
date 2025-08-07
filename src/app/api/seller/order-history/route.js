import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { sellerId, userId } = await req.json();
    const id = sellerId || userId;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing sellerId or userId' }), { status: 400 });
    }

    // Get all orders for this seller
    const orders = await prisma.order.findMany({
      where: {
        product: {
          sellerId: Number(id)
        }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: {
              select: {
                url: true
              }
            }
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add computed fields for analysis
    const ordersWithComputedFields = orders.map(order => {
      const totalAmount = (order.product.price * order.quantity) + (order.product.shippingPrice || 0);
      const orderDate = new Date(order.createdAt);
      const orderMonth = orderDate.getMonth();
      const orderYear = orderDate.getFullYear();
      
      return {
        ...order,
        totalAmount,
        orderDate,
        orderMonth,
        orderYear,
        formattedDate: orderDate.toLocaleDateString('en-MY', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
    });

    return new Response(JSON.stringify({ orders: ordersWithComputedFields }), { status: 200 });
  } catch (error) {
    console.error('Error fetching order history:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 