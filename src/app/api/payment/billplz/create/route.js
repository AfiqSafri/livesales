import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { orderId, amount, description, buyerName, buyerEmail, buyerPhone } = await req.json();

    if (!orderId || !amount || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get order details from database
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { product: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create real Billplz bill using production API
    // Use sandbox or production based on environment
    const isSandbox = process.env.BILLPLZ_SANDBOX === 'true';
    const billplzApiUrl = isSandbox 
      ? 'https://www.billplz-sandbox.com/api/v3'
      : 'https://www.billplz.com/api/v3';
    console.log('🔧 Using Billplz API URL for order creation:', billplzApiUrl);
    
    const billplzResponse = await fetch(`${billplzApiUrl}/bills`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.BILLPLZ_API_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collection_id: process.env.BILLPLZ_COLLECTION_ID,
        description: description,
        email: buyerEmail || 'customer@example.com',
        name: buyerName || 'Customer',
        amount: Math.round(amount * 100), // Convert to cents
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/billplz/callback`,
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        reference_1_label: 'Order ID',
        reference_1: orderId.toString(),
        reference_2_label: 'Product',
        reference_2: order.product.name,
      }),
    });

    const billData = await billplzResponse.json();
    
    if (billData.error) {
      console.error('Billplz API Error:', billData.error);
      return NextResponse.json({ error: billData.error.message || 'Failed to create Billplz bill' }, { status: 400 });
    }

    // Update order with real Billplz bill ID
    await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        billplzBillId: billData.id,
        paymentMethod: 'billplz',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      billId: billData.id,
      paymentUrl: billData.url,
      bill: {
        id: billData.id,
        url: billData.url,
        amount: billData.amount,
        description: billData.description,
        email: billData.email,
        name: billData.name
      }
    });

  } catch (error) {
    console.error('Error creating Billplz bill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 