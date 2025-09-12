import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '../../../../utils/email.js';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    console.log('🔔 Starting pending receipt reminder check...');
    
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

    for (const seller of sellersWithPendingReceipts) {
      try {
        console.log(`📧 Processing seller: ${seller.name} (${seller.email})`);
        console.log(`📧 Pending receipts: ${seller.receipts.length}`);

        // Send reminder email to seller
        const emailResult = await sendEmail({
          to: seller.email,
          subject: `🔔 Reminder: ${seller.receipts.length} Pending Receipt(s) Need Review`,
          html: emailTemplates.pendingReceiptReminder({
            sellerName: seller.name,
            pendingReceipts: seller.receipts,
            totalCount: seller.receipts.length
          }).html
        });

        emailResults.push({
          sellerId: seller.id,
          sellerName: seller.name,
          sellerEmail: seller.email,
          pendingCount: seller.receipts.length,
          emailResult: emailResult
        });

        console.log(`✅ Reminder email sent to ${seller.name}:`, emailResult);

      } catch (error) {
        console.error(`❌ Error sending reminder to ${seller.name}:`, error);
        emailResults.push({
          sellerId: seller.id,
          sellerName: seller.name,
          sellerEmail: seller.email,
          pendingCount: seller.receipts.length,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reminder emails processed for ${sellersWithPendingReceipts.length} sellers`,
      results: emailResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in pending receipt reminder:', error);
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

    return NextResponse.json({
      success: true,
      sellerId: parseInt(sellerId),
      pendingCount: pendingReceipts.length,
      pendingReceipts: pendingReceipts
    });

  } catch (error) {
    console.error('Error fetching pending receipts:', error);
    return NextResponse.json({ error: 'Failed to fetch pending receipts' }, { status: 500 });
  }
}
