import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { sellerId, userId, dateRange, productId, status } = await req.json();
    const id = sellerId || userId;
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing sellerId or userId' }), { status: 400 });
    }

    // Calculate date ranges for current and previous periods
    const now = new Date();
    let currentStartDate = new Date();
    let previousStartDate = new Date();
    
    switch (dateRange) {
      case 'today':
        currentStartDate.setHours(0, 0, 0, 0);
        previousStartDate.setDate(now.getDate() - 1);
        previousStartDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        currentStartDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
        break;
      case 'month':
        currentStartDate.setMonth(now.getMonth() - 1);
        previousStartDate.setMonth(now.getMonth() - 2);
        break;
      case 'quarter':
        currentStartDate.setMonth(now.getMonth() - 3);
        previousStartDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        currentStartDate.setFullYear(now.getFullYear() - 1);
        previousStartDate.setFullYear(now.getFullYear() - 2);
        break;
      case 'all':
      default:
        currentStartDate = new Date(0);
        previousStartDate = new Date(0);
        break;
    }

    // Build where clause for current period
    let currentWhereClause = {
      createdAt: {
        gte: currentStartDate
      }
    };

    // Build where clause for previous period
    let previousWhereClause = {
      createdAt: {
        gte: previousStartDate,
        lt: currentStartDate
      }
    };

    // Add product filter if specified
    if (productId && productId !== 'all' && productId !== '') {
      currentWhereClause.productId = Number(productId);
      previousWhereClause.productId = Number(productId);
    } else {
      // Filter by seller
      currentWhereClause.product = { sellerId: Number(id) };
      previousWhereClause.product = { sellerId: Number(id) };
    }

    // Add status filter if specified
    if (status && status !== 'all') {
      currentWhereClause.status = status;
      previousWhereClause.status = status;
    }

    console.log('🔍 Current period where clause:', JSON.stringify(currentWhereClause, null, 2));
    console.log('🔍 Previous period where clause:', JSON.stringify(previousWhereClause, null, 2));

    // Get current period orders
    const currentOrders = await prisma.order.findMany({
      where: currentWhereClause,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            hasDiscount: true,
            discountPercentage: true,
            discountType: true,
            shippingPrice: true
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

    // Get previous period orders
    const previousOrders = await prisma.order.findMany({
      where: previousWhereClause,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            hasDiscount: true,
            discountPercentage: true,
            discountType: true,
            shippingPrice: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('🔍 Current orders count:', currentOrders.length);
    console.log('🔍 Previous orders count:', previousOrders.length);

    // Calculate current period metrics
    const currentRevenue = currentOrders.reduce((sum, order) => {
      const orderTotal = (order.product.price * order.quantity) + (order.shippingPrice || 0);
      return sum + orderTotal;
    }, 0);

    const currentOrdersCount = currentOrders.length;
    const currentAverageOrderValue = currentOrdersCount > 0 ? currentRevenue / currentOrdersCount : 0;

    // Calculate previous period metrics
    const previousRevenue = previousOrders.reduce((sum, order) => {
      const orderTotal = (order.product.price * order.quantity) + (order.shippingPrice || 0);
      return sum + orderTotal;
    }, 0);

    const previousOrdersCount = previousOrders.length;
    const previousAverageOrderValue = previousOrdersCount > 0 ? previousRevenue / previousOrdersCount : 0;

    // Calculate conversion rate (simplified - orders vs potential customers)
    const currentConversionRate = currentOrdersCount > 0 ? Math.min((currentOrdersCount / (currentOrdersCount + 5)) * 100, 100) : 0;
    const previousConversionRate = previousOrdersCount > 0 ? Math.min((previousOrdersCount / (previousOrdersCount + 5)) * 100, 100) : 0;

    // Get unique customers for current period
    const currentUniqueCustomers = new Set(currentOrders.map(order => order.buyer?.email || order.buyerEmail)).size;
    const previousUniqueCustomers = new Set(previousOrders.map(order => order.buyer?.email || order.buyerEmail)).size;

    // Calculate new vs repeat customers
    const allCustomerEmails = new Set();
    const currentCustomerEmails = new Set();
    
    currentOrders.forEach(order => {
      const email = order.buyer?.email || order.buyerEmail;
      if (email) {
        currentCustomerEmails.add(email);
        allCustomerEmails.add(email);
      }
    });

    previousOrders.forEach(order => {
      const email = order.buyer?.email || order.buyerEmail;
      if (email) {
        allCustomerEmails.add(email);
      }
    });

    const newCustomers = currentCustomerEmails.size;
    const repeatCustomers = Array.from(allCustomerEmails).filter(email => {
      const currentCount = currentOrders.filter(order => (order.buyer?.email || order.buyerEmail) === email).length;
      const previousCount = previousOrders.filter(order => (order.buyer?.email || order.buyerEmail) === email).length;
      return currentCount > 0 && previousCount > 0;
    }).length;

    // Calculate customer lifetime value
    const customerOrders = {};
    [...currentOrders, ...previousOrders].forEach(order => {
      const customerEmail = order.buyer?.email || order.buyerEmail;
      if (customerEmail) {
        if (!customerOrders[customerEmail]) {
          customerOrders[customerEmail] = {
            email: customerEmail,
            name: order.buyer?.name || order.buyerName,
            orders: 0,
            totalSpent: 0
          };
        }
        const orderTotal = (order.product.price * order.quantity) + (order.shippingPrice || 0);
        customerOrders[customerEmail].orders += 1;
        customerOrders[customerEmail].totalSpent += orderTotal;
      }
    });

    const customerLifetimeValue = Object.keys(customerOrders).length > 0 
      ? Object.values(customerOrders).reduce((sum, customer) => sum + customer.totalSpent, 0) / Object.keys(customerOrders).length 
      : 0;

    const retentionRate = allCustomerEmails.size > 0 ? (repeatCustomers / allCustomerEmails.size) * 100 : 0;

    // Get top products
    const productStats = {};
    currentOrders.forEach(order => {
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
      .slice(0, 5)
      .map(product => ({
        ...product,
        percentage: currentRevenue > 0 ? ((product.revenue / currentRevenue) * 100).toFixed(1) : '0.0'
      }));

    // Get order status breakdown
    const statusBreakdown = currentOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const orderStatus = Object.entries(statusBreakdown).map(([status, count]) => ({
      status,
      count,
      percentage: currentOrdersCount > 0 ? ((count / currentOrdersCount) * 100).toFixed(1) : '0.0'
    }));

    // Calculate monthly revenue
    const monthlyRevenue = {};
    currentOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      const orderTotal = (order.product.price * order.quantity) + (order.shippingPrice || 0);
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + orderTotal;
    });

    const monthlyRevenueArray = Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({
        month: month,
        revenue: revenue,
        orders: currentOrders.filter(order => {
          const orderDate = new Date(order.createdAt);
          const orderMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
          return orderMonth === month;
        }).length
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6);

    // Get recent transactions
    const recentTransactions = currentOrders.slice(0, 10).map(order => ({
      id: order.id,
      productName: order.product.name,
      customerName: order.buyer?.name || order.buyerName,
      amount: (order.product.price * order.quantity) + (order.shippingPrice || 0),
      status: order.status,
      date: order.createdAt
    }));

    // Get all products for filter dropdown
    const products = await prisma.product.findMany({
      where: { sellerId: Number(id) },
      select: {
        id: true,
        name: true
      },
      orderBy: { name: 'asc' }
    });

    return new Response(JSON.stringify({
      totalRevenue: currentRevenue,
      totalOrders: currentOrdersCount,
      averageOrderValue: currentAverageOrderValue,
      conversionRate: currentConversionRate,
      newCustomers,
      repeatCustomers,
      customerLifetimeValue,
      retentionRate,
      
      // Previous period data for growth calculations
      currentRevenue: currentRevenue,
      previousRevenue: previousRevenue,
      currentOrders: currentOrdersCount,
      previousOrders: previousOrdersCount,
      currentAverageOrderValue: currentAverageOrderValue,
      previousAverageOrderValue: previousAverageOrderValue,
      currentConversionRate: currentConversionRate,
      previousConversionRate: previousConversionRate,
      
      // Additional data
      topProducts,
      orderStatus,
      monthlyRevenue: monthlyRevenueArray,
      recentTransactions,
      products
    }), { status: 200 });

  } catch (error) {
    console.error('Error generating sales report:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 