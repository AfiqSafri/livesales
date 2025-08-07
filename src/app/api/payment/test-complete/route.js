import { PrismaClient } from '@prisma/client';
import { sendEmail, emailTemplates } from '../../../../utils/email.js';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { reference } = await req.json();
    
    if (!reference) {
      return new Response(JSON.stringify({ error: 'Reference is required' }), { status: 400 });
    }

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { reference: reference },
      include: {
        user: true
      }
    });

    console.log('🔍 Looking for payment with reference:', reference);
    console.log('🔍 Found payment:', payment ? `ID: ${payment.id}` : 'Not found');

    if (!payment) {
      return new Response(JSON.stringify({ error: 'Payment not found' }), { status: 404 });
    }

    // Update payment status to completed
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        paidAmount: payment.amount,
        paidAt: new Date()
      }
    });

    // Find and update order status using the payment relationship
    const order = await prisma.order.findFirst({
      where: { 
        paymentId: payment.id,
        status: 'pending'
      },
      include: {
        product: {
          include: {
            seller: true
          }
        }
      }
    });

    // Debug: Check all orders for this payment
    const allOrdersForPayment = await prisma.order.findMany({
      where: { paymentId: payment.id },
      select: { id: true, status: true, buyerName: true, buyerEmail: true }
    });
    
    console.log('🔍 All orders for payment:', allOrdersForPayment);
    console.log('🔍 Found order:', order ? `ID: ${order.id}` : 'No order found');
    console.log('🔍 Payment ID:', payment.id);

    if (order) {
      console.log('✅ Updating order status to paid...');
      
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'paid',
          paymentStatus: 'paid',
          paymentDate: new Date()
        }
      });

      console.log('✅ Updating product stock...');
      
      // Update product stock
      await prisma.product.update({
        where: { id: order.productId },
        data: {
          quantity: {
            decrement: order.quantity
          }
        }
      });

      console.log('✅ Sending payment confirmation emails...');
      
      // Send payment confirmation emails
      await sendPaymentConfirmationEmails({
        payment,
        order,
        product: order.product
      });

      // Create notification for buyer
      await prisma.notification.create({
        data: {
          userId: order.buyerId || 1, // Default to user 1 if no buyerId
          orderId: order.id,
          type: 'payment',
          title: 'Payment Confirmed',
          message: `Your payment of RM ${payment.amount.toFixed(2)} has been confirmed for order #${order.id}`,
          isRead: false
        }
      });

      // Create notification for seller
      await prisma.notification.create({
        data: {
          userId: order.product.seller.id,
          orderId: order.id,
          type: 'payment',
          title: 'Payment Received',
          message: `You have received a payment of RM ${payment.amount.toFixed(2)} for order #${order.id}`,
          isRead: false
        }
      });
      
      console.log('✅ Payment completion process finished successfully!');
      console.log('✅ Notifications created for buyer and seller');
    } else {
      console.log('❌ No pending order found for payment ID:', payment.id);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Payment completed successfully'
    }), { status: 200 });

  } catch (error) {
    console.error('Error completing test payment:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

// Email notification functions
async function sendPaymentConfirmationEmails({ payment, order, product }) {
  try {
    // Send confirmation email to buyer
    console.log('📧 SENDING BUYER PAYMENT CONFIRMATION EMAIL:');
    console.log('To:', order.buyerEmail || 'buyer@example.com');
    
    const buyerEmail = emailTemplates.buyerPaymentConfirmation({
      buyerName: order.buyerName || 'Customer',
      productName: product.name,
      quantity: order.quantity,
      totalAmount: payment.amount,
      reference: payment.reference,
      sellerName: product.seller.name
    });

    const buyerResult = await sendEmail({
      to: order.buyerEmail || 'buyer@example.com',
      subject: buyerEmail.subject,
      html: buyerEmail.html,
      text: buyerEmail.text
    });

    if (buyerResult.success) {
      console.log('✅ Buyer payment confirmation email sent successfully');
    } else {
      console.log('❌ Failed to send buyer email:', buyerResult.error);
    }

    // Send payment notification to seller
    console.log('📧 SENDING SELLER PAYMENT NOTIFICATION EMAIL:');
    console.log('To:', product.seller.email);
    
    const sellerEmail = emailTemplates.sellerPaymentNotification({
      sellerName: product.seller.name,
      productName: product.name,
      quantity: order.quantity,
      totalAmount: payment.amount,
      reference: payment.reference,
      buyerName: order.buyerName || 'Customer',
      buyerEmail: order.buyerEmail || 'buyer@example.com'
    });

    const sellerResult = await sendEmail({
      to: product.seller.email,
      subject: sellerEmail.subject,
      html: sellerEmail.html,
      text: sellerEmail.text
    });

    if (sellerResult.success) {
      console.log('✅ Seller payment notification email sent successfully');
    } else {
      console.log('❌ Failed to send seller email:', sellerResult.error);
    }

    // Send admin notification
    console.log('📧 SENDING ADMIN PAYMENT NOTIFICATION EMAIL:');
    console.log('To: livesalez1@gmail.com');
    
    const adminEmail = emailTemplates.adminBuyerPayment({
      buyerName: order.buyerName || 'Customer',
      buyerEmail: order.buyerEmail || 'buyer@example.com',
      sellerName: product.seller.name,
      productName: product.name,
      totalAmount: payment.amount,
      reference: payment.reference
    });

    const adminResult = await sendEmail({
      to: 'livesalez1@gmail.com',
      subject: adminEmail.subject,
      html: adminEmail.html,
      text: adminEmail.text
    });

    if (adminResult.success) {
      console.log('✅ Admin payment notification email sent successfully');
    } else {
      console.log('❌ Failed to send admin email:', adminResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error sending email notifications:', error);
  }
} 