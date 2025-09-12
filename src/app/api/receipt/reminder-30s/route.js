import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '../../../../utils/email.js';

const prisma = new PrismaClient();

// Store last reminder times to avoid spam
const lastReminderTimes = new Map();

export async function POST(req) {
  try {
    console.log('🔔 Starting 30-second pending receipt reminder check...');
    
    // Get all sellers who have pending receipts
    const sellersWithPendingReceipts = await prisma.user.findMany({
      where: {
        userType: 'seller',
        receipts: {
          some: {
            status: 'pending'
          }
        }
      },
      include: {
        receipts: {
          where: {
            status: 'pending'
          },
          include: {
            order: {
              include: {
                product: true,
                buyer: true
              }
            },
            buyer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            uploadedAt: 'desc'
          }
        }
      }
    });

    console.log(`🔔 Found ${sellersWithPendingReceipts.length} sellers with pending receipts`);

    const emailResults = [];
    const currentTime = Date.now();
    
    // Helper function to get reminder interval based on frequency
    const getReminderInterval = (frequency) => {
      switch (frequency) {
        case '30s': return 30 * 1000; // 30 seconds
        case '30m': return 30 * 60 * 1000; // 30 minutes
        case '1h': return 60 * 60 * 1000; // 1 hour
        case 'off': return null; // no reminders
        default: return 30 * 1000; // default to 30 seconds
      }
    };

    for (const seller of sellersWithPendingReceipts) {
      try {
        const sellerKey = `seller_${seller.id}`;
        const lastReminderTime = lastReminderTimes.get(sellerKey) || 0;
        const timeSinceLastReminder = currentTime - lastReminderTime;
        
        // Get seller's preferred reminder frequency
        const sellerFrequency = seller.reminderFrequency || '30s';
        const reminderInterval = getReminderInterval(sellerFrequency);

        // Skip if seller has disabled notifications
        if (sellerFrequency === 'off') {
          console.log(`⏸️ Skipping ${seller.name} - email notifications disabled`);
          emailResults.push({
            sellerId: seller.id,
            sellerName: seller.name,
            sellerEmail: seller.email,
            pendingCount: seller.receipts.length,
            reminderFrequency: sellerFrequency,
            reminderSent: false,
            reason: 'Email notifications disabled by seller'
          });
          continue;
        }

        // Only send reminder if enough time has passed based on seller's preference
        if (timeSinceLastReminder >= reminderInterval) {
          console.log(`📧 Sending reminder to seller: ${seller.name} (${seller.email})`);
          console.log(`📧 Pending receipts: ${seller.receipts.length}`);
          console.log(`📧 Reminder frequency: ${sellerFrequency}`);

          // Send reminder email to seller
          const emailResult = await sendEmail({
            to: seller.email,
            subject: `🔔 Reminder: ${seller.receipts.length} Pending Receipt(s) Need Review`,
            html: emailTemplates.pendingReceiptReminder({
              sellerName: seller.name,
              pendingReceipts: seller.receipts,
              totalCount: seller.receipts.length,
              reminderFrequency: sellerFrequency
            }).html
          });

          // Update last reminder time
          lastReminderTimes.set(sellerKey, currentTime);

          emailResults.push({
            sellerId: seller.id,
            sellerName: seller.name,
            sellerEmail: seller.email,
            pendingCount: seller.receipts.length,
            reminderFrequency: sellerFrequency,
            emailResult: emailResult,
            reminderSent: true
          });

          console.log(`✅ Reminder email sent to ${seller.name}:`, emailResult);
        } else {
          // Skip this seller as reminder was sent recently
          const remainingTime = Math.ceil((reminderInterval - timeSinceLastReminder) / 1000);
          const timeUnit = sellerFrequency === '30s' ? 's' : sellerFrequency === '30m' ? 'm' : 'h';
          console.log(`⏰ Skipping ${seller.name} - last reminder sent ${Math.ceil(timeSinceLastReminder / 1000)}s ago (next in ${remainingTime}s, frequency: ${sellerFrequency})`);
          
          emailResults.push({
            sellerId: seller.id,
            sellerName: seller.name,
            sellerEmail: seller.email,
            pendingCount: seller.receipts.length,
            reminderFrequency: sellerFrequency,
            reminderSent: false,
            reason: `Last reminder sent ${Math.ceil(timeSinceLastReminder / 1000)}s ago, next in ${remainingTime}s (frequency: ${sellerFrequency})`
          });
        }

      } catch (error) {
        console.error(`❌ Error processing reminder for ${seller.name}:`, error);
        emailResults.push({
          sellerId: seller.id,
          sellerName: seller.name,
          sellerEmail: seller.email,
          pendingCount: seller.receipts.length,
          error: error.message,
          reminderSent: false
        });
      }
    }

    const remindersSent = emailResults.filter(r => r.reminderSent).length;
    const remindersSkipped = emailResults.filter(r => !r.reminderSent).length;

    return NextResponse.json({
      success: true,
      message: `Reminder check completed. ${remindersSent} reminders sent, ${remindersSkipped} skipped`,
      summary: {
        totalSellers: sellersWithPendingReceipts.length,
        remindersSent: remindersSent,
        remindersSkipped: remindersSkipped,
        timestamp: new Date().toISOString()
      },
      results: emailResults
    });

  } catch (error) {
    console.error('❌ Error in 30-second pending receipt reminder:', error);
    return NextResponse.json({ 
      error: 'Failed to send pending receipt reminders',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }

    // Get pending receipts for specific seller
    const pendingReceipts = await prisma.receipt.findMany({
      where: {
        sellerId: parseInt(sellerId),
        status: 'pending'
      },
      include: {
        order: {
          include: {
            product: true,
            buyer: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    // Check when last reminder was sent
    const sellerKey = `seller_${sellerId}`;
    const lastReminderTime = lastReminderTimes.get(sellerKey) || 0;
    const timeSinceLastReminder = Date.now() - lastReminderTime;
    const nextReminderIn = Math.max(0, 30000 - timeSinceLastReminder); // 30 seconds

    return NextResponse.json({
      success: true,
      sellerId: parseInt(sellerId),
      pendingCount: pendingReceipts.length,
      pendingReceipts: pendingReceipts,
      reminderStatus: {
        lastReminderSent: lastReminderTime ? new Date(lastReminderTime).toISOString() : null,
        timeSinceLastReminder: timeSinceLastReminder,
        nextReminderIn: nextReminderIn,
        canSendReminder: timeSinceLastReminder >= 30000
      }
    });

  } catch (error) {
    console.error('Error fetching pending receipts:', error);
    return NextResponse.json({ error: 'Failed to fetch pending receipts' }, { status: 500 });
  }
}
