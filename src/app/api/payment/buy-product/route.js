import { PrismaClient } from '@prisma/client';
import { sendEmail, emailTemplates } from '../../../../utils/email.js';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { productId, quantity, sellerId, productName, unitPrice, totalAmount, buyerEmail, buyerName, shippingAddress, phone } = await req.json();
    
    if (!productId || !quantity || !sellerId || !productName || !unitPrice || !totalAmount || !buyerEmail || !buyerName || !shippingAddress || !phone) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Verify product exists and has sufficient stock
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: { 
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            bankName: true,
            bankAccountNumber: true,
            bankAccountHolder: true,
            bankCode: true
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

    // Check if seller has bank account information
    if (!product.seller.bankName || !product.seller.bankAccountNumber || !product.seller.bankCode) {
      return new Response(JSON.stringify({ error: 'Seller has not set up bank account information. Please contact the seller.' }), { status: 400 });
    }

    // Create a unique reference for this payment
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 6);
    const reference = `LIVE-${productId}-${randomId.toUpperCase()}`;

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId: Number(sellerId), // Using sellerId as userId for now
        amount: totalAmount,
        currency: 'MYR',
        status: 'pending',
        paymentMethod: 'test_payment',
        billplzBillId: `test_${reference}`,
        billplzUrl: `/payment/test/${reference}`,
        reference: reference,
        description: `Product purchase: ${productName}`,
        plan: 'product_purchase'
      }
    });

    // Create order record
    const order = await prisma.order.create({
      data: {
        productId: Number(productId),
        buyerId: Number(sellerId), // Using sellerId as buyerId for now (should be actual buyer ID)
        quantity: quantity,
        totalAmount: totalAmount,
        status: 'pending',
        shippingAddress: shippingAddress,
        phone: phone,
        buyerName: buyerName,
        buyerEmail: buyerEmail,
        shippingCost: product.shippingPrice || 0,
        paymentId: payment.id // Link order to payment
      }
    });

    console.log('🔍 Created payment:', payment.id);
    console.log('🔍 Created order:', order.id);
    console.log('🔍 Order paymentId:', order.paymentId);

    // Send email to buyer
    console.log('📧 SENDING BUYER ORDER EMAIL:');
    const buyerEmailTemplate = emailTemplates.buyerOrderConfirmation({
      buyerName: buyerName || 'Product Buyer',
      productName,
      quantity,
      unitPrice,
      totalAmount,
      reference: reference, // Use main reference for better UX
      sellerName: product.seller.name
    });

    const buyerResult = await sendEmail({
      to: buyerEmail || 'buyer@example.com',
      subject: buyerEmailTemplate.subject,
      html: buyerEmailTemplate.html,
      text: buyerEmailTemplate.text
    });

    if (buyerResult.success) {
      console.log('✅ Buyer order confirmation email sent successfully');
    } else {
      console.log('❌ Failed to send buyer email:', buyerResult.error);
    }

    // Send email to seller
    console.log('📧 SENDING SELLER ORDER NOTIFICATION:');
    const sellerEmailTemplate = emailTemplates.sellerOrderNotification({
      sellerName: product.seller.name,
      productName,
      quantity,
      totalAmount,
      reference: reference, // Use main reference for better UX
      buyerName: buyerName || 'Product Buyer',
      buyerEmail: buyerEmail || 'buyer@example.com'
    });

    const sellerResult = await sendEmail({
      to: product.seller.email,
      subject: sellerEmailTemplate.subject,
      html: sellerEmailTemplate.html,
      text: sellerEmailTemplate.text
    });

    if (sellerResult.success) {
      console.log('✅ Seller order notification email sent successfully');
    } else {
      console.log('❌ Failed to send seller email:', sellerResult.error);
    }

    return new Response(JSON.stringify({
      success: true,
      testPaymentUrl: `/payment/test/${reference}`,
      paymentId: payment.id,
      orderId: order.id,
      reference: reference,
      amount: totalAmount,
      currency: 'MYR'
    }), { status: 200 });

  } catch (error) {
    console.error('Error creating product payment:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

 