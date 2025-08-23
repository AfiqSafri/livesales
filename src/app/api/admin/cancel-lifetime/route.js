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
      return new Response(JSON.stringify({ error: 'Can only cancel lifetime subscriptions for sellers' }), { status: 400 });
    }

    if (user.subscriptionTier !== 'lifetime_free') {
      return new Response(JSON.stringify({ error: 'User is not on lifetime free subscription' }), { status: 400 });
    }

    // Cancel lifetime subscription and revert to free
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        isSubscribed: false,
        subscriptionStatus: 'inactive',
        subscriptionTier: null,
        subscriptionStartDate: null,
        subscriptionEndDate: null,
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
      message: 'Lifetime subscription cancelled successfully',
      user: updatedUser
    }), { status: 200 });

  } catch (error) {
    console.error('Error cancelling lifetime subscription:', error);
    return new Response(JSON.stringify({ error: 'Failed to cancel lifetime subscription' }), { status: 500 });
  }
}
