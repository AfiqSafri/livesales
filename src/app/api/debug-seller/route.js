import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get seller with ID 1 (the test seller)
    const seller = await prisma.user.findUnique({
      where: { id: 1 },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        isSubscribed: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true
      }
    });

    if (!seller) {
      return new Response(JSON.stringify({ error: 'Seller not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({
      success: true,
      seller: seller
    }), { status: 200 });

  } catch (error) {
    console.error('Error fetching seller:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 