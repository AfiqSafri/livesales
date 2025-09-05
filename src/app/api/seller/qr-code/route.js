import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

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

    // Validate file type
    if (!qrCodeFile.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Please upload a valid image file' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (qrCodeFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Convert file to base64 for storage in database
    const bytes = await qrCodeFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${qrCodeFile.type};base64,${buffer.toString('base64')}`;

    // Update seller with QR code info (storing as base64)
    const updatedSeller = await prisma.user.update({
      where: { id: sellerId },
      data: {
        qrCodeImage: base64Image,
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

    // Verify seller exists
    const seller = await prisma.user.findUnique({
      where: { id: sellerId, userType: 'seller' }
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

    return NextResponse.json({
      success: true,
      message: 'QR code removed successfully'
    });

  } catch (error) {
    console.error('QR code deletion error:', error);
    return NextResponse.json({ error: 'Failed to remove QR code' }, { status: 500 });
  }
}
