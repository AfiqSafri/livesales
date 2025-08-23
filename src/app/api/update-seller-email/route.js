import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { newEmail } = await req.json();
    
    if (!newEmail) {
      return new Response(JSON.stringify({ error: 'New email is required' }), { status: 400 });
    }

    // Update seller email
    const updatedSeller = await prisma.user.update({
      where: { id: 1 }, // Seller ID 1
      data: { email: newEmail },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true
      }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Seller email updated successfully',
      seller: updatedSeller
    }), { status: 200 });

  } catch (error) {
    console.error('Error updating seller email:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 