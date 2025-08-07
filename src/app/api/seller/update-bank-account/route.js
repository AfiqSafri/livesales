import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { bankName, bankAccountNumber, bankAccountHolder, bankCode } = await req.json();
    
    if (!bankName || !bankAccountNumber || !bankAccountHolder || !bankCode) {
      return new Response(JSON.stringify({ error: 'All bank account fields are required' }), { status: 400 });
    }

    // Use the correct seller ID (34 for Muhammad Afiq Bin Safri)
    const sellerId = 34; // This should come from session/auth in production

    // Update seller's bank account information
    const updatedUser = await prisma.user.update({
      where: { id: sellerId },
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
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 