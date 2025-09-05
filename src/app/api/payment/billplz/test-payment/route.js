import { PrismaClient } from '@prisma/client';
import { sendEmail, emailTemplates } from '../../../../../utils/email.js';

const prisma = new PrismaClient();

// Billplz Configuration
const BILLPLZ_API_KEY = process.env.BILLPLZ_API_KEY;
const BILLPLZ_COLLECTION_ID = process.env.BILLPLZ_COLLECTION_ID;
const BILLPLZ_BASE_URL = process.env.BILLPLZ_API_BASE_URL;

export async function POST(req) {
  try {
    const { productId, quantity, buyerId, buyerName, buyerEmail, shippingAddress, phone, totalAmount } = await req.json();
    
    if (!productId || !quantity || !buyerId || !buyerName || !buyerEmail || !shippingAddress || !phone || !totalAmount) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Get product and seller information
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: { 
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }

    if (product.quantity < quantity) {
      return new Response(JSON.stringify({ error: 'Insufficient stock' }), { status: 400 });
    }

    // Create a unique reference for this payment
    const reference = `BILLPLZ_TEST_${productId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create Billplz bill for test payment
    const billplzData = {
      collection_id: BILLPLZ_COLLECTION_ID,
      description: `Test Payment for ${product.name} - ${product.seller.name}`,
      email: buyerEmail,
      name: buyerName,
      amount: Math.round(totalAmount * 100), // Convert to cents
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/callback`,
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success?reference=${reference}`,
      reference_1_label: 'Product ID',
      reference_1: productId.toString(),
      reference_2_label: 'Quantity',
      reference_2: quantity.toString(),
      reference_3_label: 'Seller ID',
      reference_3: product.seller.id.toString()
    };

    console.log('🧪 Creating Billplz test payment bill:', {
      collection_id: BILLPLZ_COLLECTION_ID,
      description: billplzData.description,
      amount: billplzData.amount,
      reference: reference
    });

    // Create Billplz bill
    const billplzResponse = await fetch(`${BILLPLZ_BASE_URL}/bills`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(BILLPLZ_API_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(billplzData)
    });

    if (!billplzResponse.ok) {
      const errorData = await billplzResponse.text();
      console.error('Billplz API error:', errorData);
      return new Response(JSON.stringify({ 
        error: 'Failed to create Billplz test payment bill',
        details: errorData
      }), { status: 500 });
    }

    const billplzBill = await billplzResponse.json();
    console.log('✅ Billplz test payment bill created:', billplzBill);

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId: Number(buyerId),
        amount: totalAmount,
        currency: 'MYR',
        status: 'pending',
        paymentMethod: 'billplz_test_payment',
        billplzBillId: billplzBill.id,
        billplzUrl: billplzBill.url,
        reference: reference,
        description: `Billplz test payment for ${product.name}`,
        plan: 'product_purchase'
      }
    });

    // Create order record
    const order = await prisma.order.create({
      data: {
        productId: Number(productId),
        buyerId: Number(buyerId),
        quantity: quantity,
        totalAmount: totalAmount,
        status: 'pending',
        shippingAddress: shippingAddress,
        phone: phone,
        buyerName: buyerName,
        buyerEmail: buyerEmail,
        shippingCost: product.shippingPrice || 0,
        paymentId: payment.id
      }
    });

    console.log('🔍 Created Billplz test payment:', payment.id);
    console.log('🔍 Created order:', order.id);

    // Send email notifications
    console.log('📧 SENDING BUYER BILLPLZ TEST PAYMENT EMAIL:');
    const buyerEmailTemplate = emailTemplates.buyerOrderConfirmation({
      buyerName,
      productName: product.name,
      quantity,
      unitPrice: totalAmount / quantity,
      totalAmount,
      reference,
      sellerName: product.seller.name
    });

    const buyerResult = await sendEmail({
      to: buyerEmail,
      subject: buyerEmailTemplate.subject,
      html: buyerEmailTemplate.html,
      text: buyerEmailTemplate.text
    });

    if (buyerResult.success) {
      console.log('✅ Buyer Billplz test payment email sent successfully');
    } else {
      console.log('❌ Failed to send buyer email:', buyerResult.error);
    }

    console.log('📧 SENDING SELLER BILLPLZ TEST PAYMENT NOTIFICATION:');
    const sellerEmailTemplate = emailTemplates.sellerOrderNotification({
      sellerName: product.seller.name,
      productName: product.name,
      quantity,
      totalAmount,
      reference,
      buyerName,
      buyerEmail
    });

    const sellerResult = await sendEmail({
      to: product.seller.email,
      subject: sellerEmailTemplate.subject,
      html: sellerEmailTemplate.html,
      text: sellerEmailTemplate.text
    });

    if (sellerResult.success) {
      console.log('✅ Seller Billplz test payment notification sent successfully');
    } else {
      console.log('❌ Failed to send seller email:', sellerResult.error);
    }

    // Send admin notification
    console.log('📧 SENDING ADMIN BILLPLZ TEST PAYMENT NOTIFICATION:');
    const adminEmailTemplate = emailTemplates.adminBuyerPayment({
      buyerName,
      buyerEmail,
      sellerName: product.seller.name,
      productName: product.name,
      totalAmount,
      reference
    });

    const adminResult = await sendEmail({
      to: 'livesalez1@gmail.com',
      subject: adminEmailTemplate.subject,
      html: adminEmailTemplate.html,
      text: adminEmailTemplate.text
    });

    if (adminResult.success) {
      console.log('✅ Admin Billplz test payment notification sent successfully');
    } else {
      console.log('❌ Failed to send admin email:', adminResult.error);
    }

    return new Response(JSON.stringify({
      success: true,
      paymentUrl: billplzBill.url,
      paymentId: payment.id,
      orderId: order.id,
      reference: reference,
      billplzBillId: billplzBill.id
    }), { status: 200 });

  } catch (error) {
    console.error('Error creating Billplz test payment:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 