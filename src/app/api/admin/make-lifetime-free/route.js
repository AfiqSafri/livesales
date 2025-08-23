import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    // Check if user exists and is a seller
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    if (user.userType !== 'seller') {
      return new Response(JSON.stringify({ error: 'Can only make sellers lifetime free' }), { status: 400 });
    }

    // Update user to lifetime free
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        isSubscribed: true,
        subscriptionStatus: 'active',
        subscriptionTier: 'lifetime_free',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: null, // Lifetime means no end date
        isTrialActive: false,
        trialStartDate: null,
        trialEndDate: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        status: true,
        isSubscribed: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true
      }
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Seller made lifetime free successfully',
      user: updatedUser
    }), { status: 200 });

  } catch (error) {
    console.error('Error making seller lifetime free:', error);
    return new Response(JSON.stringify({ error: 'Failed to make seller lifetime free' }), { status: 500 });
  }
} 