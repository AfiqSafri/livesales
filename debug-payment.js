// Debug script to check payment and order status
const debugPayment = async () => {
  console.log('🔍 Debugging Payment System...\n');

  try {
    // Check recent payments
    const paymentsResponse = await fetch('/api/payment/debug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check_payments' })
    });

    if (paymentsResponse.ok) {
      const data = await paymentsResponse.json();
      console.log('📊 Recent Payments:', data.payments);
    } else {
      console.log('❌ Could not fetch payments');
    }

    // Check recent orders
    const ordersResponse = await fetch('/api/payment/debug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check_orders' })
    });

    if (ordersResponse.ok) {
      const data = await ordersResponse.json();
      console.log('📦 Recent Orders:', data.orders);
    } else {
      console.log('❌ Could not fetch orders');
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
};

// Create debug API endpoint
const createDebugEndpoint = () => {
  console.log('🔧 Creating debug endpoint...');
  
  // This would be added to your API routes
  const debugCode = `
// Add this to src/app/api/payment/debug/route.js
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
  `;
  
  console.log('Debug endpoint code:');
  console.log(debugCode);
};

// Run debug if in browser
if (typeof window !== 'undefined') {
  window.debugPayment = debugPayment;
  window.createDebugEndpoint = createDebugEndpoint;
  console.log('🧪 Debug functions loaded. Run debugPayment() to check payments and orders.');
} else {
  console.log('🔧 Debug script loaded. Create the debug endpoint and run debugPayment().');
} 