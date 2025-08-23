import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { orderId, buyerEmail } = await req.json();
    
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Order ID is required' }), { status: 400 });
    }

    // Find order with status history
    const order = await prisma.order.findFirst({
      where: { 
        id: Number(orderId),
        // If buyerEmail provided, verify it matches
        ...(buyerEmail && { buyerEmail })
      },
      include: {
        product: {
          include: {
            seller: {
              select: {
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        statusHistory: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    // Format the response
    const orderData = {
      id: order.id,
      productName: order.product.name,
      quantity: order.quantity,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      paymentDate: order.paymentDate,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      buyerName: order.buyerName,
      buyerEmail: order.buyerEmail,
      shippingAddress: order.shippingAddress,
      phone: order.phone,
      trackingNumber: order.trackingNumber,
      courierName: order.courierName,
      estimatedDelivery: order.estimatedDelivery,
      actualDelivery: order.actualDelivery,
      seller: order.product.seller,
      statusHistory: order.statusHistory.map(history => ({
        id: history.id,
        status: history.status,
        description: history.description,
        location: history.location,
        updatedBy: history.updatedBy,
        createdAt: history.createdAt
      }))
    };

    return new Response(JSON.stringify({ order: orderData }), { status: 200 });

  } catch (error) {
    console.error('Error fetching order tracking:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

// Simulate courier API integration
async function getCourierStatus(trackingNumber, courierName) {
  // This would normally call the actual courier API
  // For demo purposes, we'll simulate different statuses based on tracking number
  
  const statuses = [
    { status: 'pending', description: 'Order confirmed, awaiting pickup', location: 'Seller Warehouse' },
    { status: 'processing', description: 'Order is being prepared', location: 'Seller Warehouse' },
    { status: 'ready_to_ship', description: 'Order is packed and ready for pickup', location: 'Seller Warehouse' },
    { status: 'shipped', description: 'Order picked up by courier', location: 'Sorting Center' },
    { status: 'out_for_delivery', description: 'Order is out for delivery', location: 'Local Distribution Center' },
    { status: 'delivered', description: 'Order has been delivered', location: 'Customer Address' }
  ];

  // Simulate status based on tracking number hash
  const hash = trackingNumber.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const statusIndex = Math.abs(hash) % statuses.length;
  const baseStatus = statuses[statusIndex];

  // Add some randomness to make it more realistic
  const randomLocation = getRandomLocation(courierName);
  
  return {
    ...baseStatus,
    location: randomLocation,
    lastUpdate: new Date().toISOString(),
    courierName,
    trackingNumber
  };
}

function getRandomLocation(courierName) {
  const locations = {
    'J&T': ['J&T Sorting Center KL', 'J&T Distribution Center PJ', 'J&T Hub Shah Alam'],
    'PosLaju': ['PosLaju Sorting Center', 'PosLaju Distribution Hub', 'PosLaju Local Office'],
    'NinjaVan': ['NinjaVan Hub KL', 'NinjaVan Sorting Center', 'NinjaVan Local Station']
  };
  
  const courierLocations = locations[courierName] || ['Sorting Center', 'Distribution Hub', 'Local Office'];
  return courierLocations[Math.floor(Math.random() * courierLocations.length)];
} 