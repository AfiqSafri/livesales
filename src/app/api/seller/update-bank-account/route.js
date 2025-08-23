import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { sellerId, bankName, bankAccountNumber, bankAccountHolder, bankCode } = await req.json();
    
    if (!sellerId || !bankName || !bankAccountNumber || !bankAccountHolder || !bankCode) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        details: 'All bank account fields and seller ID are required'
      }), { status: 400 });
    }

    // Validate seller exists and is actually a seller
    const existingUser = await prisma.user.findFirst({
      where: { 
        id: parseInt(sellerId),
        userType: 'seller'
      }
    });

    if (!existingUser) {
      return new Response(JSON.stringify({ 
        error: 'Seller not found',
        details: 'The seller account does not exist or is not authorized'
      }), { status: 404 });
    }

    // Update seller's bank account information
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(sellerId) },
      data: {
        bankName,
        bankAccountNumber,
        bankAccountHolder,
        bankCode
      }
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Bank account information updated successfully',
      user: updatedUser
    }), { status: 200 });

  } catch (error) {
    console.error('Error updating bank account:', error);
    
    // Provide more specific error messages
    if (error.code === 'P2002') {
      return new Response(JSON.stringify({ 
        error: 'Database constraint violation',
        details: 'A user with this bank account information already exists'
      }), { status: 400 });
    }
    
    if (error.code === 'P2003') {
      return new Response(JSON.stringify({ 
        error: 'Invalid seller reference',
        details: 'The seller ID provided is not valid'
      }), { status: 400 });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: 'An unexpected error occurred while updating bank account information'
    }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 