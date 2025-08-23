import { prisma } from '@/lib/prisma';

// Dummy Billplz configuration for testing
const DUMMY_BILLPLZ_CONFIG = {
  apiKey: 'dummy-api-key-for-testing',
  collectionId: 'dummy-collection-id',
  sandbox: true
};

export async function POST(req) {
  try {
    const { orderId, amount, description, buyerName, buyerEmail, buyerPhone } = await req.json();

    if (!orderId || !amount || !description) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Get order details from database
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { product: true }
    });

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    // Create dummy Billplz bill response
    const dummyBillId = `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const dummyPaymentUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment-test?billId=${dummyBillId}&orderId=${orderId}&amount=${amount}`;

    // Update order with dummy Billplz bill ID
    await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        billplzBillId: dummyBillId,
        paymentMethod: 'billplz'
      }
    });

    return new Response(JSON.stringify({
      success: true,
      billId: dummyBillId,
      paymentUrl: dummyPaymentUrl,
      bill: {
        id: dummyBillId,
        url: dummyPaymentUrl,
        amount: Math.round(amount * 100),
        description: description,
        email: buyerEmail || 'customer@example.com',
        name: buyerName || 'Customer'
      }
    }), { status: 200 });

  } catch (error) {
    console.error('Error creating dummy Billplz bill:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 