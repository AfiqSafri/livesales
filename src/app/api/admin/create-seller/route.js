import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { name, email, password, phone, companyName, businessType } = await req.json();
    
    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: 'Name, email, and password are required' }), { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email already exists' }), { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the seller account
    const newSeller = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        companyName: companyName || null,
        businessType: businessType || 'individual',
        userType: 'seller',
        status: 'active',
        isSubscribed: false,
        subscriptionStatus: 'inactive'
      }
    });

    // Remove password from response
    const { password: _, ...sellerWithoutPassword } = newSeller;

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Seller account created successfully',
      seller: sellerWithoutPassword
    }), { status: 201 });

  } catch (error) {
    console.error('Error creating seller account:', error);
    return new Response(JSON.stringify({ error: 'Failed to create seller account' }), { status: 500 });
  }
} 