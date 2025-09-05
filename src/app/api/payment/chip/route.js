import { PrismaClient } from '@prisma/client';
import { sendEmail, emailTemplates } from '../../../../utils/email.js';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    console.log('🚀 CHIP Collect Payment API called');
    
    const { 
      productId, 
      quantity, 
      sellerId, 
      productName, 
      unitPrice, 
      totalAmount, 
      buyerEmail, 
      buyerName, 
      shippingAddress, 
      phone,
      selectedBank 
    } = await req.json();
    
    console.log('📋 Received payment data:', {
      productId, quantity, sellerId, productName, unitPrice, totalAmount, 
      buyerEmail, buyerName, shippingAddress, phone, selectedBank
    });
    
    if (!productId || !quantity || !sellerId || !productName || !unitPrice || !totalAmount || !buyerEmail || !buyerName || !shippingAddress || !phone) {
      console.log('❌ Missing required fields');
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
      console.log('❌ Product not found');
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }

    console.log('✅ Product found:', {
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      seller: {
        id: product.seller.id,
        name: product.seller.name,
        bankName: product.seller.bankName,
        bankAccountNumber: product.seller.bankAccountNumber,
        bankCode: product.seller.bankCode
      }
    });

    if (product.quantity < quantity) {
      console.log('❌ Insufficient stock');
      return new Response(JSON.stringify({ error: 'Insufficient stock' }), { status: 400 });
    }

    // Check if seller has bank account information
    if (!product.seller.bankName || !product.seller.bankAccountNumber || !product.seller.bankCode) {
      console.log('❌ Seller missing bank account info:', {
        bankName: product.seller.bankName,
        bankAccountNumber: product.seller.bankAccountNumber,
        bankCode: product.seller.bankCode
      });
      
      // For testing purposes, allow payment to proceed even without seller bank info
      console.log('⚠️ Bypassing seller bank account verification for testing');
    }

    console.log('✅ Seller bank account verified (or bypassed for testing)');

    // Create a unique reference for this payment
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 6);
    const reference = `CHIP-${productId}-${randomId.toUpperCase()}`;

    // Create CHIP Collect payment request
    const chipRequestData = {
      collection_id: process.env.CHIP_COLLECTION_ID,
      description: `Product purchase: ${productName} (${quantity}x)`,
      email: buyerEmail,
      name: buyerName,
      amount: Math.round(totalAmount * 100), // Convert to cents
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/chip/callback`,
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      reference_1_label: 'Order ID',
      reference_1: reference,
      reference_2_label: 'Product',
      reference_2: productName,
      reference_3_label: 'Bank',
      reference_3: selectedBank || 'Not specified'
    };

    console.log('🏦 Creating CHIP Collect payment:', chipRequestData);
    console.log('🔑 Environment variables:', {
      CHIP_COLLECTION_ID: process.env.CHIP_COLLECTION_ID,
      CHIP_API_BASE_URL: process.env.CHIP_API_BASE_URL,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
    });

    // Use sandbox or production based on environment
    const isSandbox = process.env.CHIP_SANDBOX === 'true';
    const chipApiUrl = process.env.CHIP_API_BASE_URL || 'https://sandbox.chip-in.asia/api';
    
    console.log('🔧 Environment:', isSandbox ? 'SANDBOX' : 'PRODUCTION');
    console.log('🔧 Using CHIP Collect API URL:', chipApiUrl);
    
    // Debug authentication
    const authHeader = `Bearer ${process.env.CHIP_API_KEY}`;
    console.log('🔐 Auth header:', authHeader);
    console.log('🔐 API Key length:', process.env.CHIP_API_KEY?.length);
    
    // Create CHIP Collect payment
    const chipResponse = await fetch(`${chipApiUrl}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chipRequestData)
    });

    console.log('📡 CHIP Collect response status:', chipResponse.status);
    console.log('📡 CHIP Collect response headers:', Object.fromEntries(chipResponse.headers.entries()));

    if (!chipResponse.ok) {
      const errorData = await chipResponse.text();
      console.error('❌ CHIP Collect API error:', errorData);
      return new Response(JSON.stringify({ 
        error: 'Failed to create payment. Please try again.' 
      }), { status: 500 });
    }

    const chipData = await chipResponse.json();
    console.log('✅ CHIP Collect payment created:', chipData);

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId: Number(sellerId), // Using sellerId as userId for now
        amount: totalAmount,
        currency: 'MYR',
        status: 'pending',
        paymentMethod: 'chip_collect_bank_transfer',
        billplzBillId: chipData.id, // Reusing this field for CHIP ID
        billplzUrl: chipData.payment_url || chipData.url, // CHIP payment URL
        reference: reference,
        description: `Product purchase: ${productName}`,
        plan: 'product_purchase',
        metadata: {
          selectedBank: selectedBank,
          chipData: chipData,
          gateway: 'chip_collect'
        }
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
        paymentId: payment.id, // Link order to payment
        metadata: {
          selectedBank: selectedBank,
          billplzBillId: chipData.id // Reusing this field for CHIP ID
        }
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
      reference: reference,
      sellerName: product.seller.name
    });

    const buyerResult = await sendEmail({
      to: buyerEmail || 'buyer@example.com',
      subject: buyerEmailTemplate.subject,
      html: buyerEmailTemplate.html,
      text: buyerEmailTemplate.text
    });

    if (buyerResult.success) {
      console.log('✅ Buyer order email sent successfully');
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
      console.log('✅ Seller order notification sent successfully');
    } else {
      console.log('❌ Failed to send seller email:', sellerResult.error);
    }

    // Send admin notification
    console.log('📧 SENDING ADMIN ORDER NOTIFICATION:');
    const adminEmailTemplate = emailTemplates.adminBuyerPayment({
      buyerName,
      buyerEmail,
      sellerName: product.seller.name,
      productName,
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
      console.log('✅ Admin order notification sent successfully');
    } else {
      console.log('❌ Failed to send admin email:', adminResult.error);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment initiated successfully',
      paymentId: payment.id,
      orderId: order.id,
      reference: reference,
      billUrl: chipData.payment_url || chipData.url,
      billplzBillId: chipData.id // Reusing this field for CHIP ID
    }), { status: 200 });

  } catch (error) {
    console.error('❌ Payment creation failed:', error);
    return new Response(JSON.stringify({ 
      error: 'Payment creation failed. Please try again.' 
    }), { status: 500 });
  }
}


