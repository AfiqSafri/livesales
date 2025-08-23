import { prisma } from '@/lib/prisma';

// Billplz API Configuration
const BILLPLZ_API_KEY = process.env.BILLPLZ_API_KEY;
const BILLPLZ_COLLECTION_ID = process.env.BILLPLZ_COLLECTION_ID;
const BILLPLZ_X_SIGNATURE_KEY = process.env.BILLPLZ_X_SIGNATURE_KEY;
const BILLPLZ_API_URL = 'https://www.billplz.com/api/v3';

// Subscription plan prices
const SUBSCRIPTION_PRICES = {
  pro: 20
};

export async function POST(req) {
  try {
    const { userId, plan, email, name, phone } = await req.json();
    
    if (!userId || !plan || !email || !name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Validate plan
    if (!SUBSCRIPTION_PRICES[plan]) {
      return new Response(JSON.stringify({ error: 'Invalid subscription plan' }), { status: 400 });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const amount = SUBSCRIPTION_PRICES[plan] * 100; // Convert to cents
    const description = `Livesalez ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - Monthly Subscription`;
    const reference = `LIVESALEZ_${userId}_${Date.now()}`;

    // Create Billplz bill
    const billData = {
      collection_id: BILLPLZ_COLLECTION_ID,
      description: description,
      email: email,
      name: name,
      amount: amount,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback`,
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/seller/subscription?status=success`,
      reference_1_label: 'Payment Type',
      reference_1: 'subscription',
      reference_2_label: 'User ID',
      reference_2: userId.toString(),
      reference_3_label: 'Plan',
      reference_3: plan,
      due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Due in 24 hours
    };

    const response = await fetch(`${BILLPLZ_API_URL}/bills`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(BILLPLZ_API_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(billData)
    });

    const billResponse = await response.json();

    if (!response.ok) {
      console.error('Billplz API Error:', billResponse);
      return new Response(JSON.stringify({ error: 'Failed to create payment bill' }), { status: 500 });
    }

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId: Number(userId),
        amount: amount / 100, // Store in RM
        currency: 'MYR',
        status: 'pending',
        paymentMethod: 'billplz',
        billplzBillId: billResponse.id,
        billplzUrl: billResponse.url,
        reference: reference,
        description: description,
        plan: plan
      }
    });

    return new Response(JSON.stringify({
      success: true,
      paymentId: payment.id,
      billUrl: billResponse.url,
      billId: billResponse.id,
      amount: amount / 100,
      plan: plan
    }), { status: 200 });

  } catch (error) {
    console.error('Payment creation error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 