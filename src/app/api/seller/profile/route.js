import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    // Use the correct seller ID (34 for Muhammad Afiq Bin Safri)
    const sellerId = 34; // This should come from session/auth in production

    const user = await prisma.user.findUnique({
      where: { id: sellerId },
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
        userType: true
      }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ user }), { status: 200 });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 