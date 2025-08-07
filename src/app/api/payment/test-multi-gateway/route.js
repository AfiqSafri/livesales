import { PrismaClient } from '@prisma/client';
import { sendEmail, emailTemplates } from '../../../../../utils/email.js';

const prisma = new PrismaClient();

// Payment Gateway Configurations
const PAYMENT_GATEWAYS = {
  billplz: {
    name: 'Billplz',
    apiKey: process.env.BILLPLZ_API_KEY || '73eb57f0-7d4e-42b9-a76d-e84b6c0c8968',
    collectionId: process.env.BILLPLZ_COLLECTION_ID || 'inbmmepb',
    baseUrl: process.env.BILLPLZ_BASE_URL || 'https://www.billplz-sandbox.com/api/v3',
    enabled: true
  },
  fpx: {
    name: 'FPX (Financial Process Exchange)',
    apiKey: process.env.FPX_API_KEY || 'test_fpx_key',
    merchantId: process.env.FPX_MERCHANT_ID || 'test_merchant',
    baseUrl: process.env.FPX_BASE_URL || 'https://test.fpx.com.my/api',
    enabled: true
  },
  stripe: {
    name: 'Stripe',
    apiKey: process.env.STRIPE_SECRET_KEY || 'sk_test_...',
    baseUrl: 'https://api.stripe.com/v1',
    enabled: false // Disabled for now
  },
  paypal: {
    name: 'PayPal',
    clientId: process.env.PAYPAL_CLIENT_ID || 'test_client_id',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'test_secret',
    baseUrl: process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com',
    enabled: false // Disabled for now
  }
};

// FPX Bank List (Malaysian Banks)
const FPX_BANKS = [
  { code: 'ABB0233', name: 'Affin Bank', logo: '🏦' },
  { code: 'ABMB0212', name: 'Alliance Bank', logo: '🏦' },
  { code: 'AMBB0209', name: 'AmBank', logo: '🏦' },
  { code: 'BCBB0235', name: 'CIMB Bank', logo: '🏦' },
  { code: 'BIMB0340', name: 'Bank Islam', logo: '🏦' },
  { code: 'BKRM0602', name: 'Bank Rakyat', logo: '🏦' },
  { code: 'BSNR0602', name: 'BSN', logo: '🏦' },
  { code: 'CIT0219', name: 'Citibank', logo: '🏦' },
  { code: 'HLB0224', name: 'Hong Leong Bank', logo: '🏦' },
  { code: 'HSBC0223', name: 'HSBC Bank', logo: '🏦' },
  { code: 'KFH0346', name: 'Kuwait Finance House', logo: '🏦' },
  { code: 'MBB0228', name: 'Maybank', logo: '🏦' },
  { code: 'MB2U0227', name: 'Maybank2u', logo: '🏦' },
  { code: 'OCBC0229', name: 'OCBC Bank', logo: '🏦' },
  { code: 'PBB0233', name: 'Public Bank', logo: '🏦' },
  { code: 'RHB0218', name: 'RHB Bank', logo: '🏦' },
  { code: 'SCB0216', name: 'Standard Chartered', logo: '🏦' },
  { code: 'UOB0226', name: 'UOB Bank', logo: '🏦' }
];

export async function GET(req) {
  try {
    // Return available payment gateways for frontend selection
    const availableGateways = Object.entries(PAYMENT_GATEWAYS)
      .filter(([key, config]) => config.enabled)
      .map(([key, config]) => ({
        id: key,
        name: config.name,
        logo: getGatewayLogo(key)
      }));

    return new Response(JSON.stringify({
      success: true,
      gateways: availableGateways,
      fpxBanks: FPX_BANKS
    }), { status: 200 });
  } catch (error) {
    console.error('Error fetching payment gateways:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch payment gateways' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { 
      productId, 
      quantity, 
      buyerId, 
      buyerName, 
      buyerEmail, 
      shippingAddress, 
      phone, 
      totalAmount,
      paymentGateway,
      fpxBankCode = null // For FPX payments
    } = await req.json();
    
    if (!productId || !quantity || !buyerId || !buyerName || !buyerEmail || !shippingAddress || !phone || !totalAmount || !paymentGateway) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Validate payment gateway
    if (!PAYMENT_GATEWAYS[paymentGateway] || !PAYMENT_GATEWAYS[paymentGateway].enabled) {
      return new Response(JSON.stringify({ error: 'Invalid or disabled payment gateway' }), { status: 400 });
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
    const reference = `${paymentGateway.toUpperCase()}_TEST_${productId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let paymentResult;

    // Process payment based on selected gateway
    switch (paymentGateway) {
      case 'billplz':
        paymentResult = await processBillplzPayment({
          product,
          buyerName,
          buyerEmail,
          totalAmount,
          reference,
          productId,
          quantity,
          buyerId
        });
        break;

      case 'fpx':
        paymentResult = await processFPXPayment({
          product,
          buyerName,
          buyerEmail,
          totalAmount,
          reference,
          productId,
          quantity,
          buyerId,
          fpxBankCode
        });
        break;

      default:
        return new Response(JSON.stringify({ error: 'Unsupported payment gateway' }), { status: 400 });
    }

    if (!paymentResult.success) {
      return new Response(JSON.stringify({ error: paymentResult.error }), { status: 500 });
    }

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId: Number(buyerId),
        amount: totalAmount,
        currency: 'MYR',
        status: 'pending',
        paymentMethod: `${paymentGateway}_test_payment`,
        billplzBillId: paymentResult.billId || null,
        billplzUrl: paymentResult.paymentUrl || null,
        reference: reference,
        description: `Test ${paymentGateway.toUpperCase()} payment for ${product.name}`,
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

    console.log(`🔍 Created ${paymentGateway.toUpperCase()} test payment:`, payment.id);
    console.log('🔍 Created order:', order.id);

    // Send email notifications
    await sendPaymentNotifications({
      buyerName,
      buyerEmail,
      product,
      quantity,
      totalAmount,
      reference,
      paymentGateway
    });

    return new Response(JSON.stringify({
      success: true,
      paymentUrl: paymentResult.paymentUrl,
      paymentId: payment.id,
      orderId: order.id,
      reference: reference,
      gateway: paymentGateway,
      amount: totalAmount
    }), { status: 200 });

  } catch (error) {
    console.error('Error creating test payment:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

// Process Billplz Payment
async function processBillplzPayment({ product, buyerName, buyerEmail, totalAmount, reference, productId, quantity, buyerId }) {
  const gateway = PAYMENT_GATEWAYS.billplz;
  
  const billplzData = {
    collection_id: gateway.collectionId,
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
    collection_id: gateway.collectionId,
    description: billplzData.description,
    amount: billplzData.amount,
    reference: reference
  });

  const response = await fetch(`${gateway.baseUrl}/bills`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(gateway.apiKey + ':').toString('base64')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(billplzData)
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Billplz API error:', errorData);
    return { success: false, error: 'Failed to create Billplz payment bill' };
  }

  const billplzBill = await response.json();
  console.log('✅ Billplz test payment bill created:', billplzBill);

  return {
    success: true,
    paymentUrl: billplzBill.url,
    billId: billplzBill.id
  };
}

// Process FPX Payment
async function processFPXPayment({ product, buyerName, buyerEmail, totalAmount, reference, productId, quantity, buyerId, fpxBankCode }) {
  const gateway = PAYMENT_GATEWAYS.fpx;
  
  // Simulate FPX payment creation (in real implementation, this would call FPX API)
  console.log('🧪 Creating FPX test payment:', {
    merchantId: gateway.merchantId,
    bankCode: fpxBankCode,
    amount: totalAmount,
    reference: reference
  });

  // For testing purposes, we'll simulate a successful FPX payment creation
  const fpxPaymentUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/fpx/test?reference=${reference}&bank=${fpxBankCode}`;
  
  console.log('✅ FPX test payment created (simulated)');

  return {
    success: true,
    paymentUrl: fpxPaymentUrl,
    billId: `FPX_${reference}`
  };
}

// Send payment notifications
async function sendPaymentNotifications({ buyerName, buyerEmail, product, quantity, totalAmount, reference, paymentGateway }) {
  console.log(`📧 SENDING ${paymentGateway.toUpperCase()} TEST PAYMENT EMAILS:`);
  
  // Buyer notification
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
    console.log('✅ Buyer test payment email sent successfully');
  } else {
    console.log('❌ Failed to send buyer email:', buyerResult.error);
  }

  // Seller notification
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
    console.log('✅ Seller test payment notification sent successfully');
  } else {
    console.log('❌ Failed to send seller email:', sellerResult.error);
  }
}

// Get gateway logo
function getGatewayLogo(gateway) {
  const logos = {
    billplz: '💳',
    fpx: '🏦',
    stripe: '💳',
    paypal: '💳'
  };
  return logos[gateway] || '💳';
} 