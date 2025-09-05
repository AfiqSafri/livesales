import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '../../../../utils/email.js';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { receiptId, action, sellerNotes } = await req.json();

    if (!receiptId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get receipt with related data
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        order: {
          include: {
            product: true,
            buyer: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    // Update receipt status
    const updatedReceipt = await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        status: action,
        sellerNotes: sellerNotes,
        reviewedAt: new Date()
      }
    });

    // Update order status based on action (only for regular orders)
    if (receipt.orderId) {
      const orderStatus = action === 'approved' ? 'paid' : 'payment_failed';
      const paymentStatus = action === 'approved' ? 'completed' : 'rejected';

      await prisma.order.update({
        where: { id: receipt.orderId },
        data: {
          status: orderStatus,
          paymentStatus: paymentStatus,
          paymentDate: action === 'approved' ? new Date() : null
        }
      });
    }

    // Create order for QR payments when approved
    let createdOrder = null;
    if (!receipt.orderId && action === 'approved' && receipt.paymentType === 'qr_payment') {
      // Create a new order for the QR payment
      createdOrder = await prisma.order.create({
        data: {
          buyerName: receipt.buyerName || 'QR Payment Buyer',
          buyerEmail: receipt.buyerEmail || '',
          phone: receipt.buyerPhone || '', // Use buyerPhone for phone field
          shippingAddress: receipt.shippingAddress || '',
          productId: receipt.productId || 1, // Default product if none specified
          quantity: receipt.quantity || 1,
          totalAmount: receipt.amount,
          shippingCost: 0, // QR payments typically include shipping
          status: 'paid',
          paymentStatus: 'completed',
          paymentMethod: 'qr_payment',
          sellerNotes: `QR Payment - Receipt ID: ${receipt.id}`,
          createdAt: receipt.uploadedAt,
          updatedAt: new Date()
        }
      });

      // Update the receipt to link it to the created order
      await prisma.receipt.update({
        where: { id: receiptId },
        data: { orderId: createdOrder.id }
      });

      // Decrease product stock for QR payment
      if (receipt.productId && receipt.quantity) {
        console.log(`📦 Decreasing stock for product ${receipt.productId} by ${receipt.quantity}`);
        await prisma.product.update({
          where: { id: receipt.productId },
          data: {
            quantity: {
              decrement: receipt.quantity
            }
          }
        });
        console.log(`✅ Stock decreased for product ${receipt.productId}`);
      }
    }

    // Send email notifications
    try {
      // Get buyer info for QR payments
      let buyer = null;
      if (!receipt.order && receipt.buyerId) {
        buyer = await prisma.user.findUnique({
          where: { id: receipt.buyerId, userType: 'buyer' }
        });
      }

      if (action === 'approved') {
        // Email to buyer - payment approved
        const buyerEmail = receipt.order?.buyer?.email || buyer?.email || receipt.buyerEmail;
        if (buyerEmail) {
          await sendEmail({
            to: buyerEmail,
            subject: 'Payment Approved - Order Confirmed',
            html: emailTemplates.paymentApproved({
              buyerName: receipt.order?.buyerName || receipt.buyerName || buyer?.name || 'Buyer',
              sellerName: receipt.seller.name,
              productName: receipt.order?.product?.name || receipt.productName || 'QR Payment',
              amount: receipt.amount,
              orderId: createdOrder?.id || receipt.orderId || `QR-${receipt.id}`,
              sellerNotes: sellerNotes
            })
          });
        }

        // Email to seller - payment approved
        await sendEmail({
          to: receipt.seller.email,
          subject: 'Payment Approved - Order Confirmed',
          html: emailTemplates.paymentApprovedToSeller({
            sellerName: receipt.seller.name,
            buyerName: receipt.order?.buyerName || receipt.buyerName || buyer?.name || 'Buyer',
            productName: receipt.order?.product?.name || receipt.productName || 'QR Payment',
            amount: receipt.amount,
            orderId: createdOrder?.id || receipt.orderId || `QR-${receipt.id}`
          })
        });

      } else {
        // Email to buyer - payment rejected
        const buyerEmail = receipt.order?.buyer?.email || buyer?.email || receipt.buyerEmail;
        if (buyerEmail) {
          await sendEmail({
            to: buyerEmail,
            subject: 'Payment Rejected - Please Try Again',
            html: emailTemplates.paymentRejected({
              buyerName: receipt.order?.buyerName || receipt.buyerName || buyer?.name || 'Buyer',
              sellerName: receipt.seller.name,
              productName: receipt.order?.product?.name || receipt.productName || 'QR Payment',
              amount: receipt.amount,
              orderId: receipt.orderId || `QR-${receipt.id}`,
              sellerNotes: sellerNotes
            })
          });
        }

        // Email to seller - payment rejected
        await sendEmail({
          to: receipt.seller.email,
          subject: 'Payment Rejected - Review Completed',
          html: emailTemplates.paymentRejectedToSeller({
            sellerName: receipt.seller.name,
            buyerName: receipt.order?.buyerName || receipt.buyerName || buyer?.name || 'Buyer',
            productName: receipt.order?.product?.name || receipt.productName || 'QR Payment',
            amount: receipt.amount,
            orderId: receipt.orderId || `QR-${receipt.id}`,
            sellerNotes: sellerNotes
          })
        });
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Payment ${action} successfully`,
      receipt: updatedReceipt
    });

  } catch (error) {
    console.error('Receipt approval error:', error);
    return NextResponse.json({ error: 'Failed to process receipt' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = parseInt(searchParams.get('sellerId'));
    const status = searchParams.get('status');

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }

    // Try to fetch receipts with buyer relationship
    let receipts;
    try {
      receipts = await prisma.receipt.findMany({
        where: {
          sellerId: sellerId,
          ...(status && { status: status })
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
    } catch (prismaError) {
      console.error('Prisma error:', prismaError);
      // Fallback: fetch receipts without buyer relationship
      receipts = await prisma.receipt.findMany({
        where: {
          sellerId: sellerId,
          ...(status && { status: status })
        },
        include: {
          order: {
            include: {
              product: true,
              buyer: true
            }
          }
        },
        orderBy: {
          uploadedAt: 'desc'
        }
      });
      
      // Manually fetch buyer info for each receipt
      for (let receipt of receipts) {
        if (!receipt.order && receipt.buyerId) {
          try {
            const buyer = await prisma.user.findUnique({
              where: { id: receipt.buyerId, userType: 'buyer' },
              select: { id: true, name: true, email: true }
            });
            receipt.buyer = buyer;
          } catch (buyerError) {
            console.error('Error fetching buyer:', buyerError);
            receipt.buyer = null;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      receipts: receipts
    });

  } catch (error) {
    console.error('Receipt fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 });
  }
}
