/**
 * EMAIL REMINDER SYSTEM - MAIN CRON ENDPOINT
 * 
 * This is the core email reminder system that runs automatically via Vercel Cron Jobs.
 * It checks for sellers with pending receipts and sends email notifications based on
 * their individual frequency preferences.
 * 
 * CRON SCHEDULE: Every 5 minutes
 * TRIGGER: Vercel Cron Job (vercel.json)
 * 
 * PROCESS FLOW:
 * 1. Fetch all sellers with email notifications enabled (not 'off')
 * 2. For each seller, check for pending receipts
 * 3. Verify if enough time has passed since last email (frequency check)
 * 4. Send email notification if conditions are met
 * 5. Track last email sent time to respect frequency settings
 * 
 * FREQUENCY LOGIC:
 * - 30s: Send email every 30 seconds if pending receipts exist
 * - 30m: Send email every 30 minutes if pending receipts exist
 * - 1h: Send email every hour if pending receipts exist
 * - off: Skip this seller entirely
 * 
 * DATABASE: Queries User and Receipt tables
 * EMAIL: Uses sendEmail utility with HTML/text templates
 * LOGGING: Comprehensive console logging for monitoring
 * 
 * PRODUCTION: Runs automatically on Vercel every 5 minutes
 * DEVELOPMENT: Can be triggered manually via POST request
 */

import { PrismaClient } from '@prisma/client';
import { sendEmail } from '@/utils/email';

const prisma = new PrismaClient();

// Track last email sent time per seller to respect frequency settings
// This Map stores: sellerId -> lastEmailSentTimestamp
const lastEmailSent = new Map();

/**
 * MAIN EMAIL REMINDER & AUTO-CANCEL ENDPOINT
 * 
 * This endpoint handles both email reminders and auto-cancel functionality
 * in a single cron job to work within Hobby plan limitations.
 * 
 * Processes:
 * 1. Email reminders for sellers with pending receipts
 * 2. Auto-cancel unpaid orders older than 3 minutes
 * 
 * Request: POST /api/notifications/send-reminders
 * Response: Summary of emails sent, orders cancelled, and sellers processed
 */
export async function POST(req) {
  try {
    console.log('🔔 Starting server-side email reminder check...');
    
    // Get all sellers with their reminder frequency preferences
    const sellers = await prisma.user.findMany({
      where: {
        userType: 'seller',
        reminderFrequency: {
          not: 'off' // Exclude sellers who have disabled email notifications
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        reminderFrequency: true
      }
    });

    console.log(`📧 Found ${sellers.length} sellers with email notifications enabled`);

    let totalEmailsSent = 0;
    let totalSellersChecked = 0;

    for (const seller of sellers) {
      try {
        totalSellersChecked++;
        
        // Check if seller has pending receipts
        const pendingReceipts = await prisma.receipt.findMany({
          where: {
            sellerId: seller.id,
            status: 'pending'
          },
          include: {
            order: {
              include: {
                product: true
              }
            }
          },
          orderBy: {
            uploadedAt: 'desc'
          }
        });

        if (pendingReceipts.length === 0) {
          console.log(`📭 No pending receipts for seller ${seller.name} (${seller.email})`);
          continue;
        }

        console.log(`📋 Found ${pendingReceipts.length} pending receipts for seller ${seller.name}`);

        // Check if we should send email based on frequency setting
        const shouldSendEmail = shouldSendReminderEmail(seller, pendingReceipts);
        
        if (!shouldSendEmail) {
          console.log(`⏰ Skipping email for ${seller.name} - frequency limit not reached`);
          continue;
        }

        // Send email notification
        await sendPendingReceiptReminderEmail(seller, pendingReceipts);
        
        // Update last email sent time
        lastEmailSent.set(seller.id, new Date());
        
        totalEmailsSent++;
        console.log(`✅ Email sent to ${seller.name} (${seller.email})`);

      } catch (sellerError) {
        console.error(`❌ Error processing seller ${seller.name}:`, sellerError);
      }
    }

    // AUTO-CANCEL UNPAID ORDERS
    console.log('🚫 Starting auto-cancel process...');
    
    // Find orders that are pending payment for more than 3 minutes
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
    
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

    console.log(`[AUTO-CANCEL] Found ${unpaidOrders.length} unpaid orders older than 3 minutes`);

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
            console.log(`[AUTO-CANCEL] Sending cancellation email to: ${order.buyerEmail}`);
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
              console.log(`[AUTO-CANCEL] Cancellation email sent successfully to ${order.buyerEmail}`);
            } else {
              console.error(`[AUTO-CANCEL] Failed to send cancellation email to ${order.buyerEmail}`);
            }
          } catch (emailError) {
            console.error(`[AUTO-CANCEL] Error sending cancellation email to ${order.buyerEmail}:`, emailError);
          }
        } else {
          console.log(`[AUTO-CANCEL] No buyer email found for order #${order.id}`);
        }

        cancelledCount++;
        console.log(`[AUTO-CANCEL] Cancelled order #${order.id} and restored ${order.quantity} units to product #${order.productId}`);
      } catch (error) {
        console.error(`[AUTO-CANCEL] Error cancelling order #${order.id}:`, error);
      }
    }

    const summary = {
      success: true,
      totalSellersChecked,
      totalEmailsSent,
      sellersProcessed: sellers.length,
      cancelledOrders: cancelledCount,
      sellerSettings: sellers.map(seller => ({
        id: seller.id,
        name: seller.name,
        email: seller.email,
        reminderFrequency: seller.reminderFrequency
      })),
      timestamp: new Date().toISOString()
    };

    console.log('📊 Combined email reminder and auto-cancel completed:', summary);
    
    return Response.json(summary);

  } catch (error) {
    console.error('❌ Error in server-side email reminder system:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to process email reminders',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

function shouldSendReminderEmail(seller, pendingReceipts) {
  const now = new Date();
  const lastSent = lastEmailSent.get(seller.id);
  
  if (!lastSent) {
    // First time checking this seller, send email
    return true;
  }

  const timeSinceLastEmail = now - lastSent;
  const frequencyMs = getFrequencyInMs(seller.reminderFrequency);
  
  return timeSinceLastEmail >= frequencyMs;
}

function getFrequencyInMs(frequency) {
  switch (frequency) {
    case '30s': return 30 * 1000; // 30 seconds
    case '30m': return 30 * 60 * 1000; // 30 minutes
    case '1h': return 60 * 60 * 1000; // 1 hour
    default: return 30 * 60 * 1000; // Default to 30 minutes
  }
}

async function sendPendingReceiptReminderEmail(seller, pendingReceipts) {
  const frequencyText = getFrequencyText(seller.reminderFrequency);
  const receiptCount = pendingReceipts.length;
  
  // Create email content
  const subject = `🔔 ${receiptCount} Pending Receipt${receiptCount > 1 ? 's' : ''} Awaiting Your Review`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔔 Pending Receipt Reminder</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">You have ${receiptCount} pending receipt${receiptCount > 1 ? 's' : ''} to review</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Hello ${seller.name},</h2>
        
        <p style="color: #666; line-height: 1.6;">
          You have <strong>${receiptCount} pending receipt${receiptCount > 1 ? 's' : ''}</strong> that require your review and approval. 
          Please log in to your seller dashboard to process these receipts.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404; margin-top: 0;">📋 Receipt Summary:</h3>
          ${pendingReceipts.slice(0, 5).map(receipt => `
            <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
              <strong>Amount:</strong> RM ${receipt.amount.toFixed(2)}<br>
              <strong>Buyer:</strong> ${receipt.order ? receipt.order.buyerName : (receipt.buyerName || 'Unknown')}<br>
              <strong>Product:</strong> ${receipt.order ? receipt.order.product.name : (receipt.productName || 'QR Payment')}<br>
              <strong>Uploaded:</strong> ${new Date(receipt.uploadedAt).toLocaleDateString()}
            </div>
          `).join('')}
          ${receiptCount > 5 ? `<p style="color: #666; font-style: italic;">... and ${receiptCount - 5} more receipt${receiptCount - 5 > 1 ? 's' : ''}</p>` : ''}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/seller/dashboard" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            📱 Go to Dashboard
          </a>
        </div>
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #1976d2; font-size: 14px;">
            <strong>📧 Email Frequency:</strong> ${frequencyText}<br>
            <strong>⏰ Last Check:</strong> ${new Date().toLocaleString()}
          </p>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 0;">
          This is an automated reminder based on your email notification settings. 
          You can change your notification frequency in your seller dashboard settings.
        </p>
      </div>
    </div>
  `;

  const textContent = `
Pending Receipt Reminder

Hello ${seller.name},

You have ${receiptCount} pending receipt${receiptCount > 1 ? 's' : ''} that require your review and approval.

Receipt Summary:
${pendingReceipts.slice(0, 5).map(receipt => `
- Amount: RM ${receipt.amount.toFixed(2)}
- Buyer: ${receipt.order ? receipt.order.buyerName : (receipt.buyerName || 'Unknown')}
- Product: ${receipt.order ? receipt.order.product.name : (receipt.productName || 'QR Payment')}
- Uploaded: ${new Date(receipt.uploadedAt).toLocaleDateString()}
`).join('')}
${receiptCount > 5 ? `... and ${receiptCount - 5} more receipt${receiptCount - 5 > 1 ? 's' : ''}` : ''}

Please log in to your seller dashboard to process these receipts:
${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/seller/dashboard

Email Frequency: ${frequencyText}
Last Check: ${new Date().toLocaleString()}

This is an automated reminder based on your email notification settings.
  `;

  await sendEmail({
    to: seller.email,
    subject,
    html: htmlContent,
    text: textContent
  });
}

function getFrequencyText(frequency) {
  switch (frequency) {
    case '30s': return 'Every 30 seconds';
    case '30m': return 'Every 30 minutes';
    case '1h': return 'Every 1 hour';
    case 'off': return 'Disabled';
    default: return 'Every 30 minutes';
  }
}
