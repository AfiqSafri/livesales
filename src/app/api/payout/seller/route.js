import { PrismaClient } from '@prisma/client';
import { sendEmail, emailTemplates } from '../../../../utils/email.js';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { sellerId, amount, orderId, description } = await req.json();
    
    if (!sellerId || !amount || !orderId) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: sellerId, amount, orderId' 
      }), { status: 400 });
    }

    // Get seller information including bank details
    const seller = await prisma.user.findUnique({
      where: { 
        id: Number(sellerId),
        userType: 'seller'
      },
      select: {
        id: true,
        name: true,
        email: true,
        bankName: true,
        bankAccountNumber: true,
        bankAccountHolder: true,
        bankCode: true
      }
    });

    if (!seller) {
      return new Response(JSON.stringify({ 
        error: 'Seller not found or not authorized' 
      }), { status: 404 });
    }

    // Check if seller has bank account configured
    if (!seller.bankName || !seller.bankAccountNumber || !seller.bankCode) {
      return new Response(JSON.stringify({ 
        error: 'Seller has not configured bank account information' 
      }), { status: 400 });
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        product: true,
        payment: true
      }
    });

    if (!order) {
      return new Response(JSON.stringify({ 
        error: 'Order not found' 
      }), { status: 404 });
    }

    // Check if order is paid
    if (order.paymentStatus !== 'paid') {
      return new Response(JSON.stringify({ 
        error: 'Order is not paid yet' 
      }), { status: 400 });
    }

    // Check if payout already exists
    const existingPayout = await prisma.payout.findFirst({
      where: { 
        orderId: Number(orderId),
        status: { in: ['pending', 'processing', 'completed'] }
      }
    });

    if (existingPayout) {
      return new Response(JSON.stringify({ 
        error: 'Payout already exists for this order' 
      }), { status: 400 });
    }

    // Calculate platform fee (e.g., 5% of order amount)
    const platformFee = amount * 0.05; // 5% platform fee
    const sellerAmount = amount - platformFee;

    // Create payout record
    const payout = await prisma.payout.create({
      data: {
        sellerId: Number(sellerId),
        orderId: Number(orderId),
        amount: sellerAmount,
        platformFee: platformFee,
        totalAmount: amount,
        status: 'pending',
        bankName: seller.bankName,
        bankAccountNumber: seller.bankAccountNumber,
        bankAccountHolder: seller.bankAccountHolder,
        bankCode: seller.bankCode,
        description: description || `Payout for order #${orderId}`,
        reference: `PAYOUT_${orderId}_${Date.now()}`
      }
    });

    // Attempt to process payout via Billplz Payout API
    try {
      const payoutData = {
        collection_id: process.env.BILLPLZ_COLLECTION_ID,
        bank_code: seller.bankCode,
        bank_account_number: seller.bankAccountNumber,
        bank_account_holder: seller.bankAccountHolder,
        amount: Math.round(sellerAmount * 100), // Convert to cents
        description: `Payout to ${seller.name} for order #${orderId}`,
        reference_1_label: 'Order ID',
        reference_1: orderId.toString(),
        reference_2_label: 'Seller ID',
        reference_2: sellerId.toString(),
        reference_3_label: 'Payout ID',
        reference_3: payout.id.toString()
      };

      console.log('🏦 Processing Billplz payout:', payoutData);

      // Note: This is the Billplz Payout API endpoint (you need to verify the exact endpoint)
      const payoutResponse = await fetch(`${process.env.BILLPLZ_API_BASE_URL}/payouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(process.env.BILLPLZ_API_KEY + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payoutData)
      });

      if (payoutResponse.ok) {
        const payoutResult = await payoutResponse.json();
        
        // Update payout status to processing
        await prisma.payout.update({
          where: { id: payout.id },
          data: {
            status: 'processing',
            billplzPayoutId: payoutResult.id,
            processedAt: new Date()
          }
        });

        console.log('✅ Payout initiated successfully:', payoutResult);
      } else {
        const errorData = await payoutResponse.text();
        console.error('❌ Billplz payout API error:', errorData);
        
        // Update payout status to failed
        await prisma.payout.update({
          where: { id: payout.id },
          data: {
            status: 'failed',
            failureReason: 'Billplz API error: ' + errorData
          }
        });

        return new Response(JSON.stringify({ 
          error: 'Failed to process payout via Billplz. Please try manual transfer.' 
        }), { status: 500 });
      }

    } catch (payoutError) {
      console.error('❌ Payout processing error:', payoutError);
      
      // Update payout status to failed
      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          status: 'failed',
          failureReason: 'Payout processing error: ' + payoutError.message
        }
      });

      return new Response(JSON.stringify({ 
        error: 'Payout processing failed. Please try manual transfer.' 
      }), { status: 500 });
    }

    // Send email notifications
    console.log('📧 SENDING SELLER PAYOUT NOTIFICATION:');
    const sellerEmailTemplate = emailTemplates.sellerPayoutNotification({
      sellerName: seller.name,
      orderId: orderId,
      amount: sellerAmount,
      platformFee: platformFee,
      totalAmount: amount,
      reference: payout.reference
    });

    const sellerResult = await sendEmail({
      to: seller.email,
      subject: sellerEmailTemplate.subject,
      html: sellerEmailTemplate.html,
      text: sellerEmailTemplate.text
    });

    if (sellerResult.success) {
      console.log('✅ Seller payout notification sent successfully');
    } else {
      console.log('❌ Failed to send seller email:', sellerResult.error);
    }

    // Send admin notification
    console.log('📧 SENDING ADMIN PAYOUT NOTIFICATION:');
    const adminEmailTemplate = emailTemplates.adminPayoutNotification({
      sellerName: seller.name,
      sellerEmail: seller.email,
      orderId: orderId,
      amount: sellerAmount,
      platformFee: platformFee,
      totalAmount: amount,
      reference: payout.reference
    });

    const adminResult = await sendEmail({
      to: 'livesalez1@gmail.com',
      subject: adminEmailTemplate.subject,
      html: adminEmailTemplate.html,
      text: adminEmailTemplate.text
    });

    if (adminResult.success) {
      console.log('✅ Admin payout notification sent successfully');
    } else {
      console.log('❌ Failed to send admin email:', adminResult.error);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Payout initiated successfully',
      payoutId: payout.id,
      reference: payout.reference,
      amount: sellerAmount,
      platformFee: platformFee,
      status: 'processing'
    }), { status: 200 });

  } catch (error) {
    console.error('Error processing seller payout:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}




