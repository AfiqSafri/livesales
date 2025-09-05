import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    // Billplz sends data as form data, not JSON
    const formData = await req.formData();
    
    // Extract Billplz webhook data
    const billplz_id = formData.get('billplz[id]');
    const billplz_paid = formData.get('billplz[paid]');
    const billplz_paid_at = formData.get('billplz[paid_at]');
    const billplz_paid_amount = formData.get('billplz[paid_amount]');
    const billplz_x_signature = formData.get('x_signature');

    if (!billplz_id) {
      return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 });
    }

    // Verify webhook signature for security
    if (process.env.BILLPLZ_X_SIGNATURE_KEY) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.BILLPLZ_X_SIGNATURE_KEY)
        .update(`billplz[id]${billplz_id}billplz[paid]${billplz_paid}billplz[paid_at]${billplz_paid_at}`)
        .digest('hex');

      if (billplz_x_signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    // Find order by Billplz bill ID
    const order = await prisma.order.findFirst({
      where: { billplzBillId: billplz_id },
      include: {
        product: {
          include: {
            seller: true
          }
        }
      }
    });

    if (!order) {
      console.error('Order not found for bill ID:', billplz_id);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order payment status based on Billplz response
    if (billplz_paid === 'true') {
      // Update order with comprehensive payment and status information
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          paymentDate: new Date(billplz_paid_at),
          status: 'processing', // Move to processing after payment
          billplzPaid: true,
          updatedAt: new Date()
        }
      });

      // Create status history entry for payment success
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'processing',
          description: 'Payment received successfully via Billplz. Order is now being processed.',
          location: 'Payment Gateway',
          updatedBy: 'system'
        }
      });

      // Create status history entry for payment completion
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'paid',
          description: `Payment of RM${billplz_paid_amount || order.totalAmount} received via Billplz.`,
          location: 'Payment Gateway',
          updatedBy: 'system'
        }
      });

      // Send email notification to buyer
      if (order.buyerEmail) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          await fetch(`${baseUrl}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: order.buyerEmail,
              subject: 'Payment Successful - Order Confirmed',
              html: `
                <h2>Payment Successful!</h2>
                <p>Your payment for order #${order.id} has been received successfully.</p>
                <p><strong>Order Details:</strong></p>
                <ul>
                  <li>Product: ${order.product.name}</li>
                  <li>Quantity: ${order.quantity}</li>
                  <li>Total Amount: RM${order.totalAmount.toFixed(2)}</li>
                  <li>Payment Method: Billplz</li>
                </ul>
                <p>Your order is now being processed and will be shipped soon.</p>
                <p>You can track your order status in your dashboard.</p>
                <p>Thank you for your purchase!</p>
              `,
              text: `Payment Successful! Your payment for order #${order.id} has been received successfully. Your order is now being processed.`
            })
          });
        } catch (emailError) {
          console.error('Error sending payment confirmation email:', emailError);
        }
      }

      // Send notification to seller about new paid order
      if (order.product.seller.email) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          await fetch(`${baseUrl}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: order.product.seller.email,
              subject: 'New Paid Order Received',
              html: `
                <h2>New Paid Order Received!</h2>
                <p>You have received a new paid order #${order.id}.</p>
                <p><strong>Order Details:</strong></p>
                <ul>
                  <li>Product: ${order.product.name}</li>
                  <li>Quantity: ${order.quantity}</li>
                  <li>Total Amount: RM${order.totalAmount.toFixed(2)}</li>
                  <li>Buyer: ${order.buyerName}</li>
                  <li>Buyer Email: ${order.buyerEmail}</li>
                  <li>Shipping Address: ${order.shippingAddress}</li>
                </ul>
                <p>Please process and ship this order as soon as possible.</p>
              `,
              text: `New Paid Order Received! Order #${order.id} has been paid and is ready for processing.`
            })
          });
        } catch (emailError) {
          console.error('Error sending seller notification email:', emailError);
        }
      }

      console.log(`Payment successful for order ${order.id}, bill ${billplz_id}`);

    } else {
      // Payment failed
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'failed',
          status: 'pending',
          updatedAt: new Date()
        }
      });

      // Create status history entry for payment failure
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'failed',
          description: 'Payment failed via Billplz. Please try again or contact support.',
          location: 'Payment Gateway',
          updatedBy: 'system'
        }
      });

      // Send email notification to buyer about payment failure
      if (order.buyerEmail) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          await fetch(`${baseUrl}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: order.buyerEmail,
              subject: 'Payment Failed - Order #' + order.id,
              html: `
                <h2>Payment Failed</h2>
                <p>Your payment for order #${order.id} was unsuccessful.</p>
                <p>Please try again or contact our support team for assistance.</p>
                <p>Order Details:</p>
                <ul>
                  <li>Product: ${order.product.name}</li>
                  <li>Quantity: ${order.quantity}</li>
                  <li>Total Amount: RM${order.totalAmount.toFixed(2)}</li>
                </ul>
              `,
              text: `Payment Failed! Your payment for order #${order.id} was unsuccessful. Please try again.`
            })
          });
        } catch (emailError) {
          console.error('Error sending payment failure email:', emailError);
        }
      }

      console.log(`Payment failed for order ${order.id}, bill ${billplz_id}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing Billplz callback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 