import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { sellerId, userId, dateRange, productId, status } = await req.json();
    const id = sellerId || userId;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing sellerId or userId' }), { status: 400 });
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }

    // Build where clause
    let whereClause = {
      createdAt: {
        gte: startDate
      }
    };

    console.log('🔍 Debug - productId:', productId, 'type:', typeof productId);
    
    if (productId && productId !== '' && productId !== 'undefined') {
      whereClause.productId = Number(productId);
      console.log('🔍 Using productId filter:', Number(productId));
    } else {
      whereClause.product = { sellerId: Number(id) };
      console.log('🔍 Using seller filter for sellerId:', Number(id));
    }

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    console.log('🔍 Final whereClause:', JSON.stringify(whereClause, null, 2));
    
    // Get orders
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            hasDiscount: true,
            discountPercentage: true,
            discountType: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => {
      const orderTotal = (order.product.price * order.quantity) + (order.shippingPrice || 0);
      return sum + orderTotal;
    }, 0);

    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get unique customers
    const uniqueCustomers = new Set(orders.map(order => order.buyer.email)).size;

    // Calculate conversion rate (simplified)
    const conversionRate = totalOrders > 0 ? (totalOrders / (totalOrders + 10)) * 100 : 0; // Mock data

    // Get top products
    const productStats = {};
    orders.forEach(order => {
      const productId = order.product.id;
      if (!productStats[productId]) {
        productStats[productId] = {
          id: productId,
          name: order.product.name,
          revenue: 0,
          orders: 0,
          quantity: 0
        };
      }
      const orderTotal = (order.product.price * order.quantity) + (order.shippingPrice || 0);
      productStats[productId].revenue += orderTotal;
      productStats[productId].orders += 1;
      productStats[productId].quantity += order.quantity;
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get order status breakdown
    const statusBreakdown = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Calculate monthly revenue
    const monthlyRevenue = {};
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      const orderTotal = (order.product.price * order.quantity) + (order.shippingPrice || 0);
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + orderTotal;
    });

    // Customer insights
    const customerOrders = {};
    orders.forEach(order => {
      const customerEmail = order.buyer.email;
      if (!customerOrders[customerEmail]) {
        customerOrders[customerEmail] = {
          email: customerEmail,
          name: order.buyer.name,
          orders: 0,
          totalSpent: 0
        };
      }
      const orderTotal = (order.product.price * order.quantity) + (order.shippingPrice || 0);
      customerOrders[customerEmail].orders += 1;
      customerOrders[customerEmail].totalSpent += orderTotal;
    });

    const repeatCustomers = Object.values(customerOrders).filter(customer => customer.orders > 1).length;
    const averageCustomerLifetimeValue = Object.values(customerOrders).reduce((sum, customer) => sum + customer.totalSpent, 0) / Object.keys(customerOrders).length || 0;

    return new Response(JSON.stringify({
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        uniqueCustomers,
        conversionRate,
        repeatCustomers,
        averageCustomerLifetimeValue
      },
      topProducts,
      statusBreakdown,
      monthlyRevenue,
      customerInsights: {
        repeatCustomers,
        averageCustomerLifetimeValue,
        retentionRate: uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0
      }
    }), { status: 200 });
  } catch (error) {
    console.error('Error generating sales report:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 