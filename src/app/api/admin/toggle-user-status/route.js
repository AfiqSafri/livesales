import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { userId, status } = await req.json();
    
    if (!userId || !status) {
      return new Response(JSON.stringify({ error: 'User ID and status are required' }), { status: 400 });
    }

    if (!['active', 'inactive'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Status must be either "active" or "inactive"' }), { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        status: true
      }
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: `User status updated to ${status}`,
      user: updatedUser
    }), { status: 200 });

  } catch (error) {
    console.error('Error updating user status:', error);
    return new Response(JSON.stringify({ error: 'Failed to update user status' }), { status: 500 });
  }
} 