import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '../../../../utils/email.js';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const formData = await req.formData();
    const orderId = formData.get('orderId');
    const sellerId = parseInt(formData.get('sellerId'));
    const buyerId = parseInt(formData.get('buyerId'));
    const amount = parseFloat(formData.get('amount'));
    const receiptFile = formData.get('receipt');
    
    // QR Payment specific data
    const buyerName = formData.get('buyerName');
    const buyerEmail = formData.get('buyerEmail');
    const buyerPhone = formData.get('buyerPhone');
    const productName = formData.get('productName');
    const productId = formData.get('productId') ? parseInt(formData.get('productId')) : null;
    const quantity = formData.get('quantity') ? parseInt(formData.get('quantity')) : null;
    const shippingAddress = formData.get('shippingAddress');

    // Check if this is a QR payment (temporary order ID)
    const isQRPayment = orderId && orderId.toString().startsWith('temp-');

    if (!sellerId || !buyerId || !amount || !receiptFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file type
    if (!receiptFile.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Please upload a valid image file' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (receiptFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // For QR payments, we don't need to verify order exists
    let order = null;
    if (!isQRPayment) {
      const orderIdInt = parseInt(orderId);
      if (!orderIdInt) {
        return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
      }

      // Verify order exists
      order = await prisma.order.findUnique({
        where: { id: orderIdInt },
        include: {
          product: true,
          buyer: true
        }
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
    }

    // Get seller info
    const seller = await prisma.user.findUnique({
      where: { id: sellerId, userType: 'seller' }
    });

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Get buyer info for QR payments
    let buyer = null;
    if (isQRPayment) {
      buyer = await prisma.user.findUnique({
        where: { id: buyerId, userType: 'buyer' }
      });

      if (!buyer) {
        return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
      }
    }

    // Convert file to base64 for storage in database
    const bytes = await receiptFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${receiptFile.type};base64,${buffer.toString('base64')}`;

    // Generate unique filename for reference
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = receiptFile.name.split('.').pop();
    const fileName = `receipt_${isQRPayment ? 'qr' : orderId}_${timestamp}_${randomString}.${fileExtension}`;

    // Create receipt record (storing as base64)
    const receipt = await prisma.receipt.create({
      data: {
        orderId: isQRPayment ? null : parseInt(orderId), // null for QR payments
        sellerId: sellerId,
        buyerId: buyerId,
        receiptImage: base64Image, // Store as base64 instead of file path
        amount: amount,
        status: 'pending',
        paymentType: isQRPayment ? 'qr_payment' : 'order_payment',
        // QR Payment specific data
        buyerName: isQRPayment ? buyerName : null,
        buyerEmail: isQRPayment ? buyerEmail : null,
        buyerPhone: isQRPayment ? buyerPhone : null,
        productName: isQRPayment ? productName : null,
        productId: isQRPayment ? productId : null,
        quantity: isQRPayment ? quantity : null,
        shippingAddress: isQRPayment ? shippingAddress : null
      }
    });

    // Update order payment status (only for regular orders)
    if (!isQRPayment && order) {
      await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: {
          paymentStatus: 'pending_review',
          receiptUrl: base64Image // Store base64 instead of file path
        }
      });
    }

    // Create notification for seller
    try {
      console.log('🔔 Creating notification for seller...');
      await prisma.notification.create({
        data: {
          userId: sellerId,
          orderId: isQRPayment ? null : parseInt(orderId),
          type: 'receipt_uploaded',
          title: 'New Payment Receipt Uploaded',
          message: `A buyer has uploaded a payment receipt for ${isQRPayment ? (productName || 'QR Payment') : order?.product?.name} (RM ${amount.toFixed(2)}). Please review and approve/reject.`,
          isRead: false
        }
      });
      console.log('✅ Notification created successfully');
    } catch (notificationError) {
      console.error('❌ Notification creation error:', notificationError);
      // Don't fail the request if notification fails
    }

    // Send email notifications
    console.log('📧 Starting email notifications...');
    console.log('Receipt ID:', receipt.id);
    console.log('Is QR Payment:', isQRPayment);
    console.log('Seller:', seller.name, seller.email);
    console.log('Buyer Name:', buyerName);
    console.log('Buyer Email:', buyerEmail);
    console.log('Buyer from DB:', buyer?.name, buyer?.email);
    
    try {
      // Email to seller
      console.log('📧 Sending email to seller:', seller.email);
      const sellerEmailResult = await sendEmail({
        to: seller.email,
        subject: 'New Payment Receipt Uploaded',
        html: emailTemplates.receiptUploadedToSeller({
          sellerName: seller.name,
          buyerName: isQRPayment ? (buyerName || buyer?.name) : order?.buyerName,
          productName: isQRPayment ? (productName || 'QR Payment') : order?.product?.name,
          amount: amount,
          orderId: isQRPayment ? `QR-${receipt.id}` : orderId,
          receiptUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/receipt/image?file=${fileName}`
        }).html
      });
      console.log('✅ Seller email result:', sellerEmailResult);

      // Email to buyer
      const buyerEmailAddress = isQRPayment ? (buyerEmail || buyer?.email) : order?.buyer?.email;
      console.log('📧 Buyer email address:', buyerEmailAddress);
      
      if (buyerEmailAddress) {
        console.log('📧 Sending email to buyer:', buyerEmailAddress);
        const buyerEmailResult = await sendEmail({
          to: buyerEmailAddress,
          subject: 'Payment Receipt Received',
          html: emailTemplates.receiptUploadedToBuyer({
            buyerName: isQRPayment ? (buyerName || buyer?.name) : order?.buyerName,
            sellerName: seller.name,
            productName: isQRPayment ? (productName || 'QR Payment') : order?.product?.name,
            amount: amount,
            orderId: isQRPayment ? `QR-${receipt.id}` : orderId
          }).html
        });
        console.log('✅ Buyer email result:', buyerEmailResult);
      } else {
        console.log('⚠️ No buyer email address found');
      }
    } catch (emailError) {
      console.error('❌ Email notification error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Receipt uploaded successfully',
      receipt: {
        id: receipt.id,
        status: receipt.status,
        uploadedAt: receipt.uploadedAt,
        paymentType: receipt.paymentType
      }
    });

  } catch (error) {
    console.error('Receipt upload error:', error);
    return NextResponse.json({ error: 'Failed to upload receipt' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = parseInt(searchParams.get('orderId'));
    const sellerId = parseInt(searchParams.get('sellerId'));

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const receipts = await prisma.receipt.findMany({
      where: {
        orderId: orderId,
        ...(sellerId && { sellerId: sellerId })
      },
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
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      receipts: receipts
    });

  } catch (error) {
    console.error('Receipt fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 });
  }
}
