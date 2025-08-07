import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    // Verify cron secret (optional security measure)
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    
    // You can set this in your environment variables
    const expectedSecret = process.env.CRON_SECRET || 'your-cron-secret';
    
    if (secret !== expectedSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Find orders that are pending payment for more than 3 minutes
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000); // 3 minutes
    
    const unpaidOrders = await prisma.order.findMany({
      where: {
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: {
          lt: threeMinutesAgo
        }
      },
      include: {
        product: true
      }
    });

    console.log(`[CRON] Found ${unpaidOrders.length} unpaid orders older than 3 minutes`);

    let cancelledCount = 0;

    for (const order of unpaidOrders) {
      try {
        // Update order status to cancelled
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'cancelled',
            paymentStatus: 'failed',
            updatedAt: new Date()
          }
        });

        // Restore product quantity
        await prisma.product.update({
          where: { id: order.productId },
          data: {
            quantity: {
              increment: order.quantity
            }
          }
        });

        // Create status history entry
        await prisma.orderStatusHistory.create({
                     data: {
             orderId: order.id,
             status: 'cancelled',
             description: 'Order automatically cancelled due to non-payment after 3 minutes',
             location: 'System',
             updatedBy: 'system'
           }
        });

        // Send email notification to buyer about cancellation
        if (order.buyerEmail) {
          try {
            console.log(`[CRON] Sending cancellation email to: ${order.buyerEmail}`);
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const emailResponse = await fetch(`${baseUrl}/api/email/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: order.buyerEmail,
                subject: 'Order Cancelled - Payment Timeout',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                                             <h2 style="color: #dc3545; margin: 0 0 15px 0;">Order Cancelled</h2>
                       <p style="margin: 0 0 15px 0; color: #6c757d;">Your order #${order.id} has been automatically cancelled due to non-payment after 3 minutes.</p>
                    </div>
                    
                    <div style="background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                      <h3 style="color: #495057; margin: 0 0 15px 0;">Order Details</h3>
                      <ul style="color: #495057; padding-left: 20px;">
                        <li><strong>Product:</strong> ${order.product.name}</li>
                        <li><strong>Quantity:</strong> ${order.quantity}</li>
                        <li><strong>Total Amount:</strong> RM${order.totalAmount.toFixed(2)}</li>
                        <li><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</li>
                      </ul>
                    </div>
                    
                    <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                      <p style="margin: 0; color: #0c5460;">
                        <strong>What happens next?</strong><br>
                        You can place a new order if you still wish to purchase this product. The items have been returned to stock and are available for other customers.
                      </p>
                    </div>
                    
                    <div style="text-align: center; color: #6c757d; font-size: 14px;">
                      <p style="margin: 0;">Thank you for your interest in our products!</p>
                      <p style="margin: 5px 0 0 0;">© 2025 Livesalez. All rights reserved.</p>
                    </div>
                  </div>
                `,
                                 text: `Order #${order.id} has been cancelled due to non-payment after 3 minutes.\n\nOrder Details:\n- Product: ${order.product.name}\n- Quantity: ${order.quantity}\n- Total Amount: RM${order.totalAmount.toFixed(2)}\n\nYou can place a new order if you still wish to purchase this product.`
              })
            });

            if (emailResponse.ok) {
              console.log(`[CRON] Cancellation email sent successfully to ${order.buyerEmail}`);
            } else {
              console.error(`[CRON] Failed to send cancellation email to ${order.buyerEmail}`);
            }
          } catch (emailError) {
            console.error(`[CRON] Error sending cancellation email to ${order.buyerEmail}:`, emailError);
          }
        } else {
          console.log(`[CRON] No buyer email found for order #${order.id}`);
        }

        cancelledCount++;
        console.log(`[CRON] Cancelled order #${order.id} and restored ${order.quantity} units to product #${order.productId}`);
      } catch (error) {
        console.error(`[CRON] Error cancelling order #${order.id}:`, error);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      cancelledOrders: cancelledCount,
      timestamp: new Date().toISOString()
    }), { status: 200 });

  } catch (error) {
    console.error('[CRON] Error in auto-cancel process:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 