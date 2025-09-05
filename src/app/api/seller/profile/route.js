import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { sellerId } = await req.json();

    if (!sellerId) {
      return new Response(JSON.stringify({ 
        error: 'Missing seller ID',
        details: 'Seller ID is required to fetch profile'
      }), { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { 
        id: parseInt(sellerId),
        userType: 'seller'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        companyName: true,
        businessType: true,
        profileImage: true,
        bankName: true,
        bankAccountNumber: true,
        bankAccountHolder: true,
        bankCode: true,
        userType: true,
        qrCodeImage: true,
        qrCodeDescription: true
      }
    });

    if (!user) {
      return new Response(JSON.stringify({ 
        error: 'Seller not found',
        details: 'The seller account does not exist or is not authorized'
      }), { status: 404 });
    }

    return new Response(JSON.stringify({ user }), { status: 200 });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: 'An unexpected error occurred while fetching the profile'
    }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');

    if (!sellerId) {
      return new Response(JSON.stringify({ 
        error: 'Missing seller ID',
        details: 'Seller ID is required to fetch profile'
      }), { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { 
        id: parseInt(sellerId),
        userType: 'seller'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        companyName: true,
        businessType: true,
        profileImage: true,
        bankName: true,
        bankAccountNumber: true,
        bankAccountHolder: true,
        bankCode: true,
        userType: true,
        qrCodeImage: true,
        qrCodeDescription: true
      }
    });

    if (!user) {
      return new Response(JSON.stringify({ 
        error: 'Seller not found',
        details: 'The seller account does not exist or is not authorized'
      }), { status: 404 });
    }

    return new Response(JSON.stringify({ user }), { status: 200 });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: 'An unexpected error occurred while fetching the profile'
    }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 