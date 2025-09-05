import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendEmail, emailTemplates } from '../../../../utils/email.js';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const receiptId = searchParams.get('receiptId');
    const action = searchParams.get('action'); // 'approve' or 'reject'
    const token = searchParams.get('token'); // Security token

    if (!receiptId || !action || !token) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify token (simple security check)
    const expectedToken = `receipt_${receiptId}_${process.env.EMAIL_SECRET_TOKEN || 'default_secret'}`;
    if (token !== expectedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get receipt with related data
    const receipt = await prisma.receipt.findUnique({
      where: { id: parseInt(receiptId) },
      include: {
        seller: true,
        buyer: true,
        order: {
          include: {
            product: true,
            buyer: true
          }
        }
      }
    });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    if (receipt.status !== 'pending') {
      return NextResponse.json({ error: 'Receipt already processed' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // Update receipt status
    const updatedReceipt = await prisma.receipt.update({
      where: { id: parseInt(receiptId) },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        sellerNotes: `Processed via email - ${action}d`
      }
    });

    // Update order status for regular orders
    if (receipt.orderId) {
      const orderStatus = action === 'approve' ? 'paid' : 'payment_failed';
      const paymentStatus = action === 'approve' ? 'completed' : 'rejected';

      await prisma.order.update({
        where: { id: receipt.orderId },
        data: {
          status: orderStatus,
          paymentStatus: paymentStatus,
          paymentDate: action === 'approve' ? new Date() : null
        }
      });
    }

    // Create order for QR payments when approved
    let createdOrder = null;
    if (!receipt.orderId && action === 'approve' && receipt.paymentType === 'qr_payment') {
      createdOrder = await prisma.order.create({
        data: {
          buyerName: receipt.buyerName || 'QR Payment Buyer',
          buyerEmail: receipt.buyerEmail || '',
          phone: receipt.buyerPhone || '',
          shippingAddress: receipt.shippingAddress || '',
          productId: receipt.productId || 1,
          quantity: receipt.quantity || 1,
          totalAmount: receipt.amount,
          shippingCost: 0,
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
        where: { id: parseInt(receiptId) },
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

    // Send confirmation emails
    try {
      // Email to buyer
      const buyerEmail = receipt.order?.buyer?.email || receipt.buyer?.email || receipt.buyerEmail;
      if (buyerEmail) {
        const buyerTemplate = action === 'approve' 
          ? emailTemplates.paymentApproved({
              buyerName: receipt.order?.buyerName || receipt.buyerName || receipt.buyer?.name || 'Buyer',
              sellerName: receipt.seller.name,
              productName: receipt.order?.product?.name || receipt.productName || 'QR Payment',
              amount: receipt.amount,
              orderId: createdOrder?.id || receipt.orderId || `QR-${receipt.id}`,
              sellerNotes: `Processed via email - ${action}d`
            })
          : emailTemplates.paymentRejected({
              buyerName: receipt.order?.buyerName || receipt.buyerName || receipt.buyer?.name || 'Buyer',
              sellerName: receipt.seller.name,
              productName: receipt.order?.product?.name || receipt.productName || 'QR Payment',
              amount: receipt.amount,
              orderId: receipt.orderId || `QR-${receipt.id}`,
              sellerNotes: `Processed via email - ${action}d`
            });

        await sendEmail({
          to: buyerEmail,
          subject: action === 'approve' ? 'Payment Approved - Order Confirmed' : 'Payment Rejected - Please Try Again',
          html: buyerTemplate.html
        });
      }

      // Email to seller
      const sellerTemplate = action === 'approve'
        ? emailTemplates.paymentApprovedToSeller({
            sellerName: receipt.seller.name,
            buyerName: receipt.order?.buyerName || receipt.buyerName || receipt.buyer?.name || 'Buyer',
            productName: receipt.order?.product?.name || receipt.productName || 'QR Payment',
            amount: receipt.amount,
            orderId: createdOrder?.id || receipt.orderId || `QR-${receipt.id}`
          })
        : emailTemplates.paymentRejectedToSeller({
            sellerName: receipt.seller.name,
            buyerName: receipt.order?.buyerName || receipt.buyerName || receipt.buyer?.name || 'Buyer',
            productName: receipt.order?.product?.name || receipt.productName || 'QR Payment',
            amount: receipt.amount,
            orderId: receipt.orderId || `QR-${receipt.id}`,
            sellerNotes: `Processed via email - ${action}d`
          });

      await sendEmail({
        to: receipt.seller.email,
        subject: action === 'approve' ? 'Payment Approved - Order Confirmed' : 'Payment Rejected - Review Completed',
        html: sellerTemplate.html
      });

    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }

    // Return JSON response for AJAX requests
    return NextResponse.json({
      success: true,
      action: action,
      receiptId: receipt.id,
      status: newStatus,
      orderId: createdOrder?.id || receipt.orderId,
      message: action === 'approve' 
        ? 'Payment approved successfully! Order created and both parties notified.'
        : 'Payment rejected. Buyer has been notified.'
    });

  } catch (error) {
    console.error('Email approval error:', error);
    return NextResponse.json({ error: 'Failed to process receipt' }, { status: 500 });
  }
}
