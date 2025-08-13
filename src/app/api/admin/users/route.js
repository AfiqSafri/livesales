import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    // In production, you should check if the requesting user is an admin
    // For now, we'll allow access to all users

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        status: true,
        createdAt: true,
        phone: true,
        companyName: true,
        businessType: true,
        isSubscribed: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        isTrialActive: true,
        trialStartDate: true,
        trialEndDate: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return new Response(JSON.stringify({ users }), { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), { status: 500 });
  }
} 