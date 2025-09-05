import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '../../../../../utils/email.js';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    console.log('🔔 Chip Payment Callback received');
    
    const body = await req.json();
    console.log('📋 Callback data:', body);

    // Extract payment information from Chip callback
    const { 
      id, 
      status, 
      amount, 
      currency, 
      reference,
      created_at,
      paid_at 
    } = body;

    if (!id || !reference) {
      console.log('❌ Missing required fields in callback');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the payment by Chip payment ID (stored in billplzBillId field)
    const payment = await prisma.payment.findFirst({
      where: {
        billplzBillId: id.toString() // Chip payment ID is stored in this field
      },
      include: {
        orders: {
          include: {
            product: {
              include: {
                seller: true
              }
            },
            buyer: true
          }
        }
      }
    });

    if (!payment) {
      console.log('❌ Payment not found for Chip ID:', id);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    console.log('✅ Found payment:', payment.id);
    console.log('✅ Payment status:', status);

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: status === 'paid' ? 'paid' : 'failed',
        paidAmount: status === 'paid' ? parseFloat(amount) : null,
        paidAt: status === 'paid' && paid_at ? new Date(paid_at) : null
      }
    });

    if (status === 'paid') {
      console.log('💰 Payment successful! Processing...');

      // Update all related orders
      for (const order of payment.orders) {
        if (order.status === 'pending') {
          console.log(`📦 Updating order ${order.id} to paid`);
          
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'paid',
              paymentStatus: 'completed',
              paymentDate: new Date()
            }
          });

          // Update product stock
          await prisma.product.update({
            where: { id: order.productId },
            data: {
              quantity: {
                decrement: order.quantity
              }
            }
          });

          console.log(`✅ Order ${order.id} updated and stock decremented`);
        }
      }

      // Send payment confirmation emails
      console.log('📧 Sending payment confirmation emails...');
      
      for (const order of payment.orders) {
        if (order.status === 'paid') {
          // Send confirmation email to buyer
          if (order.buyer?.email) {
            console.log('📧 Sending buyer payment confirmation...');
            
            const buyerEmail = emailTemplates.buyerPaymentConfirmation({
              buyerName: order.buyerName || order.buyer.name,
              productName: order.product.name,
              quantity: order.quantity,
              totalAmount: payment.amount,
              reference: payment.reference,
              sellerName: order.product.seller.name
            });

            const buyerResult = await sendEmail({
              to: order.buyer.email,
              subject: buyerEmail.subject,
              html: buyerEmail.html,
              text: buyerEmail.text
            });

            if (buyerResult.success) {
              console.log('✅ Buyer payment confirmation email sent');
            } else {
              console.log('❌ Failed to send buyer email:', buyerResult.error);
            }
          }

          // Send payment notification to seller
          console.log('📧 Sending seller payment notification...');
          
          const sellerEmail = emailTemplates.sellerPaymentNotification({
            sellerName: order.product.seller.name,
            productName: order.product.name,
            quantity: order.quantity,
            totalAmount: payment.amount,
            reference: payment.reference,
            buyerName: order.buyerName || order.buyer?.name || 'Customer',
            buyerEmail: order.buyerEmail || order.buyer?.email || 'buyer@example.com'
          });

          const sellerResult = await sendEmail({
            to: order.product.seller.email,
            subject: sellerEmail.subject,
            html: sellerEmail.html,
            text: sellerEmail.text
          });

          if (sellerResult.success) {
            console.log('✅ Seller payment notification email sent');
          } else {
            console.log('❌ Failed to send seller email:', sellerResult.error);
          }

          // Send admin notification
          console.log('📧 Sending admin payment notification...');
          
          const adminEmail = emailTemplates.adminBuyerPayment({
            buyerName: order.buyerName || order.buyer?.name || 'Customer',
            buyerEmail: order.buyerEmail || order.buyer?.email || 'buyer@example.com',
            sellerName: order.product.seller.name,
            productName: order.product.name,
            totalAmount: payment.amount,
            reference: payment.reference
          });

          const adminResult = await sendEmail({
            to: 'livesalez1@gmail.com', // Admin email
            subject: adminEmail.subject,
            html: adminEmail.html,
            text: adminEmail.text
          });

          if (adminResult.success) {
            console.log('✅ Admin payment notification email sent');
          } else {
            console.log('❌ Failed to send admin email:', adminResult.error);
          }

          // Create notifications
          await prisma.notification.createMany({
            data: [
              {
                userId: order.buyerId || 1,
                orderId: order.id,
                type: 'payment',
                title: 'Payment Confirmed',
                message: `Your payment of RM ${payment.amount.toFixed(2)} has been confirmed for order #${order.id}`,
                isRead: false
              },
              {
                userId: order.product.seller.id,
                orderId: order.id,
                type: 'payment',
                title: 'Payment Received',
                message: `You have received a payment of RM ${payment.amount.toFixed(2)} for order #${order.id}`,
                isRead: false
              }
            ]
          });

          console.log('✅ Notifications created for buyer and seller');
        }
      }

      console.log('🎉 Chip payment callback processed successfully!');
    } else {
      console.log('❌ Payment failed or cancelled');
      
      // Update orders to failed status
      for (const order of payment.orders) {
        if (order.status === 'pending') {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'cancelled',
              paymentStatus: 'failed'
            }
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Callback processed successfully' 
    });

  } catch (error) {
    console.error('❌ Chip payment callback error:', error);
    return NextResponse.json({ 
      error: 'Callback processing failed',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(req) {
  return NextResponse.json({ 
    message: 'Chip payment callback endpoint',
    method: 'POST',
    description: 'This endpoint receives payment status updates from Chip payment gateway'
  });
}
