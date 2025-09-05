import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const formData = await req.formData();
    const sellerId = parseInt(formData.get('sellerId'));
    const description = formData.get('qrCodeDescription') || '';
    const qrCodeFile = formData.get('qrCodeImage');

    if (!sellerId || !qrCodeFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify seller exists
    const seller = await prisma.user.findUnique({
      where: { id: sellerId, userType: 'seller' }
    });

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'qr-codes');
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = qrCodeFile.name.split('.').pop();
    const fileName = `qr_${sellerId}_${timestamp}_${randomString}.${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save file
    const bytes = await qrCodeFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update seller with QR code info
    const updatedSeller = await prisma.user.update({
      where: { id: sellerId },
      data: {
        qrCodeImage: `/uploads/qr-codes/${fileName}`,
        qrCodeDescription: description
      }
    });

    return NextResponse.json({
      success: true,
      message: 'QR code uploaded successfully',
      qrCodeImage: updatedSeller.qrCodeImage,
      qrCodeDescription: updatedSeller.qrCodeDescription
    });

  } catch (error) {
    console.error('QR code upload error:', error);
    return NextResponse.json({ error: 'Failed to upload QR code' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = parseInt(searchParams.get('sellerId'));

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }

    const seller = await prisma.user.findUnique({
      where: { id: sellerId, userType: 'seller' },
      select: {
        id: true,
        name: true,
        qrCodeImage: true,
        qrCodeDescription: true
      }
    });

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      seller: seller
    });

  } catch (error) {
    console.error('QR code fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch QR code' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = parseInt(searchParams.get('sellerId'));

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }

    // Get current QR code info
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { qrCodeImage: true }
    });

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Update seller to remove QR code
    await prisma.user.update({
      where: { id: sellerId },
      data: {
        qrCodeImage: null,
        qrCodeDescription: null
      }
    });

    // Delete file if it exists
    if (seller.qrCodeImage) {
      try {
        const fs = require('fs');
        const filePath = path.join(process.cwd(), 'public', seller.qrCodeImage);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        console.error('File deletion error:', fileError);
        // Don't fail the request if file deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'QR code removed successfully'
    });

  } catch (error) {
    console.error('QR code deletion error:', error);
    return NextResponse.json({ error: 'Failed to remove QR code' }, { status: 500 });
  }
}
