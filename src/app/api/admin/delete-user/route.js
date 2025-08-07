import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(req) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Prevent deletion of admin accounts
    if (user.userType === 'admin') {
      return new Response(JSON.stringify({ error: 'Cannot delete admin accounts' }), { status: 403 });
    }

    // Delete user's products first (if they're a seller)
    if (user.userType === 'seller') {
      await prisma.product.deleteMany({
        where: { sellerId: Number(userId) }
      });
    }

    // Delete user's orders
    await prisma.order.deleteMany({
      where: { 
        OR: [
          { buyerId: Number(userId) },
          { product: { sellerId: Number(userId) } }
        ]
      }
    });

    // Delete user's payments
    await prisma.payment.deleteMany({
      where: { userId: Number(userId) }
    });

    // Finally delete the user
    await prisma.user.delete({
      where: { id: Number(userId) }
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'User deleted successfully'
    }), { status: 200 });

  } catch (error) {
    console.error('Error deleting user:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete user' }), { status: 500 });
  }
} 