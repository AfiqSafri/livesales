import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const BILLPLZ_X_SIGNATURE_KEY = process.env.BILLPLZ_X_SIGNATURE_KEY;

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-signature');
    
    // Verify Billplz signature
    const expectedSignature = crypto
      .createHmac('sha256', BILLPLZ_X_SIGNATURE_KEY)
      .update(body)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('Invalid signature');
      return new Response('Invalid signature', { status: 400 });
    }

    const data = JSON.parse(body);
    const { id, state, paid_amount, paid_at, reference_1, reference_2, reference_3 } = data;

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: { billplzBillId: id }
    });

    if (!payment) {
      console.error('Payment not found:', id);
      return new Response('Payment not found', { status: 404 });
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: state === 'paid' ? 'completed' : 'failed',
        paidAmount: state === 'paid' ? parseFloat(paid_amount) / 100 : null,
        paidAt: state === 'paid' ? new Date(paid_at) : null
      }
    });

    // If payment is successful, handle based on payment type
    if (state === 'paid') {
      const paymentType = reference_1; // 'subscription' or product ID
      
      if (paymentType === 'subscription') {
        // Handle subscription payment
        const userId = parseInt(reference_2);
        const plan = reference_3;
        
        // Calculate subscription end date (1 month from now)
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

        await prisma.user.update({
          where: { id: userId },
          data: {
            isSubscribed: true,
            subscriptionTier: plan,
            subscriptionStatus: 'active',
            subscriptionStartDate: new Date(),
            subscriptionEndDate: subscriptionEndDate,
            isTrialActive: false
          }
        });

        console.log(`Subscription activated for user ${userId}, plan: ${plan}`);
      } else {
        // Handle product purchase
        const productId = parseInt(reference_1);
        const quantity = parseInt(reference_2);
        const sellerId = parseInt(reference_3);
        
        // Update order status using payment relationship
        const order = await prisma.order.findFirst({
          where: { 
            paymentId: payment.id,
            status: 'pending'
          }
        });
        
        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'paid'
            }
          });
        }
        
        // Update product stock
        await prisma.product.update({
          where: { id: productId },
          data: {
            quantity: {
              decrement: quantity
            }
          }
        });
        
        console.log(`Product purchase completed: Product ${productId}, Quantity ${quantity}`);
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Payment callback error:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 