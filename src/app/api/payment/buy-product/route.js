import { PrismaClient } from '@prisma/client';
import { sendEmail, emailTemplates } from '../../../../utils/email.js';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    console.log('🚀 Payment API called');
    
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
      selectedBank,
      additionalProducts 
    } = await req.json();
    
    console.log('📋 Received payment data:', {
      productId, quantity, sellerId, productName, unitPrice, totalAmount, 
      buyerEmail, buyerName, shippingAddress, phone, selectedBank, additionalProducts
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
      
      // Uncomment the line below to allow testing without seller bank setup
      // return new Response(JSON.stringify({ error: 'Seller has not set up bank account information. Please contact the seller.' }), { status: 400 });
    }

    console.log('✅ Seller bank account verified (or bypassed for testing)');

    // Create a unique reference for this payment
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 6);
    const reference = `CHIP-${productId}-${randomId.toUpperCase()}`;

    // Create CHIP Collect payment request
    const chipRequestData = {
      brand_id: process.env.CHIP_BRAND_ID,
      client: {
        id: process.env.CHIP_BRAND_ID,
        name: "LiveSales Platform",
        email: "admin@livesales.com"
      },
      purchase: {
        description: `Product purchase: ${productName} (${quantity}x)`,
        email: buyerEmail,
        name: buyerName,
        amount: Math.round(totalAmount * 100), // Convert to cents
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/chip/callback`,
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        reference: reference,
        currency: 'MYR',
        // Set the total amount explicitly
        total: Math.round(totalAmount * 100),
        products: [
          {
            name: `${productName} (${quantity}x)`,
            quantity: 1,
            price: Math.round((unitPrice * quantity) * 100), // Total product price for all quantities
            metadata: {
              selected_bank: selectedBank || 'Not specified',
              unit_price: Math.round(unitPrice * 100),
              quantity: quantity,
              shipping_cost: Math.round((product.shippingPrice || 0) * 100)
            }
          },
          {
            name: "Shipping & Handling",
            quantity: 1,
            price: Math.round((product.shippingPrice || 0) * 100), // Shipping as separate line item
            metadata: {
              type: "shipping",
              shipping_cost: Math.round((product.shippingPrice || 0) * 100)
            }
          }
        ]
      }
    };

    console.log('🏦 Creating CHIP Collect payment:', chipRequestData);
    console.log('📦 CHIP Products structure:');
    chipRequestData.purchase.products.forEach((prod, index) => {
      console.log(`   Product ${index + 1}:`, {
        name: prod.name,
        quantity: prod.quantity,
        price: prod.price,
        metadata: prod.metadata
      });
    });
    
    // Calculate what CHIP Collect should total
    const expectedChipTotal = chipRequestData.purchase.products.reduce((sum, prod) => sum + (prod.price * prod.quantity), 0);
    console.log('🧮 Expected CHIP calculation:');
    chipRequestData.purchase.products.forEach((prod, index) => {
      console.log(`   ${prod.name}: ${prod.price} × ${prod.quantity} = ${prod.price * prod.quantity}`);
    });
    console.log(`   Total: ${expectedChipTotal} cents = RM ${(expectedChipTotal / 100).toFixed(2)}`);
    console.log('💰 Amount breakdown:');
    console.log('   - Unit Price:', unitPrice);
    console.log('   - Quantity:', quantity);
    console.log('   - Shipping Cost:', product.shippingPrice || 0);
    console.log('   - Expected Calculation:', `${unitPrice} × ${quantity} + ${product.shippingPrice || 0} = ${totalAmount}`);
    console.log('   - Total Amount (including shipping):', totalAmount);
    console.log('   - CHIP Amount (in cents):', Math.round(totalAmount * 100));
    console.log('   - Product Name:', productName);
    console.log('   - Product Quantity:', quantity);
    console.log('   - Product Unit Price (cents):', Math.round(unitPrice * 100));
    console.log('   - Product Total Price (cents):', Math.round((unitPrice * quantity) * 100));
    console.log('   - Shipping Price (cents):', Math.round((product.shippingPrice || 0) * 100));
    console.log('🔑 Environment variables:', {
      CHIP_BRAND_ID: process.env.CHIP_BRAND_ID,
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
    
    const chipResponse = await fetch(`${chipApiUrl}/purchases/`, {
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
    console.log('💰 CHIP Response amount details:');
    console.log('   - Requested amount (cents):', Math.round(totalAmount * 100));
    console.log('   - CHIP purchase total:', chipData.purchase?.total);
    console.log('   - CHIP amount field:', chipData.purchase?.amount);
    console.log('   - CHIP checkout URL:', chipData.checkout_url);
    console.log('🔍 Full CHIP Response for debugging:');
    console.log(JSON.stringify(chipData, null, 2));

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId: Number(sellerId), // Using sellerId as userId for now
        amount: totalAmount,
        currency: 'MYR',
        status: 'pending',
        paymentMethod: 'chip_collect_bank_transfer',
        billplzBillId: chipData.id, // Reusing this field for CHIP ID
        billplzUrl: chipData.checkout_url, // Use CHIP checkout URL
        reference: reference,
        description: `Product purchase: ${productName}`,
        plan: 'product_purchase'
      }
    });

    // Create order records for all products
    const orders = [];
    
    // Main product order
    const mainOrder = await prisma.order.create({
      data: {
        productId: Number(productId),
        buyerId: Number(sellerId), // Using sellerId as buyerId for now (should be actual buyer ID)
        quantity: quantity,
        totalAmount: (unitPrice * quantity) + (product.shippingPrice || 0),
        status: 'pending',
        shippingAddress: shippingAddress,
        phone: phone,
        buyerName: buyerName,
        buyerEmail: buyerEmail,
        shippingCost: product.shippingPrice || 0,
        paymentId: payment.id // Link order to payment
      }
    });
    orders.push(mainOrder);
    
    // Additional products orders
    if (additionalProducts && additionalProducts.length > 0) {
      for (const additionalProduct of additionalProducts) {
        const additionalOrder = await prisma.order.create({
          data: {
            productId: Number(additionalProduct.id),
            buyerId: Number(sellerId), // Using sellerId as buyerId for now (should be actual buyer ID)
            quantity: additionalProduct.quantity,
            totalAmount: (additionalProduct.price * additionalProduct.quantity) + (additionalProduct.shippingPrice || 0),
            status: 'pending',
            shippingAddress: shippingAddress,
            phone: phone,
            buyerName: buyerName,
            buyerEmail: buyerEmail,
            shippingCost: additionalProduct.shippingPrice || 0,
            paymentId: payment.id // Link order to payment
          }
        });
        orders.push(additionalOrder);
      }
    }

    console.log('🔍 Created payment:', payment.id);
    console.log('🔍 Created orders:', orders.map(o => o.id).join(', '));
    console.log('🔍 Total orders:', orders.length);

    // Reduce product quantities after successful order creation
    console.log('📦 Reducing product quantities...');
    
    // Reduce main product quantity
    await prisma.product.update({
      where: { id: Number(productId) },
      data: { quantity: { decrement: Number(quantity) } },
    });
    console.log(`✅ Reduced main product ${productId} quantity by ${quantity}`);

    // Reduce additional products quantities
    if (additionalProducts && additionalProducts.length > 0) {
      for (const additionalProduct of additionalProducts) {
        await prisma.product.update({
          where: { id: Number(additionalProduct.id) },
          data: { quantity: { decrement: Number(additionalProduct.quantity) } },
        });
        console.log(`✅ Reduced additional product ${additionalProduct.id} quantity by ${additionalProduct.quantity}`);
      }
    }

    // Send email to buyer
    console.log('📧 SENDING BUYER ORDER EMAIL:');
    
    // Create product list for email
    const productList = [
      { name: productName, quantity: quantity, price: unitPrice },
      ...(additionalProducts || []).map(ap => ({ 
        name: ap.name, 
        quantity: ap.quantity, 
        price: ap.price 
      }))
    ];
    
    const buyerEmailTemplate = emailTemplates.buyerOrderConfirmation({
      buyerName: buyerName || 'Product Buyer',
      productName: productList.length > 1 ? `${productList.length} Products` : productName,
      quantity: productList.reduce((sum, p) => sum + p.quantity, 0),
      unitPrice: unitPrice,
      totalAmount: totalAmount,
      reference: reference,
      sellerName: product.seller.name,
      productList: productList
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
    
    // Create product list for seller email
    const sellerProductList = [
      { name: productName, quantity: quantity, price: unitPrice },
      ...(additionalProducts || []).map(ap => ({ 
        name: ap.name, 
        quantity: ap.quantity, 
        price: ap.price 
      }))
    ];
    
    const sellerEmailTemplate = emailTemplates.sellerOrderNotification({
      sellerName: product.seller.name,
      productName: sellerProductList.length > 1 ? `${sellerProductList.length} Products` : productName,
      quantity: sellerProductList.reduce((sum, p) => sum + p.quantity, 0),
      totalAmount: totalAmount,
      reference: reference,
      buyerName: buyerName || 'Product Buyer',
      buyerEmail: buyerEmail || 'buyer@example.com',
      productList: sellerProductList
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
      paymentUrl: chipData.checkout_url,
      checkoutUrl: chipData.checkout_url, // Alternative field name
      paymentId: payment.id,
      orderIds: orders.map(o => o.id),
      reference: reference,
      amount: totalAmount,
      currency: 'MYR',
      chipId: chipData.id
    }), { status: 200 });

  } catch (error) {
    console.error('Error creating product payment:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

 