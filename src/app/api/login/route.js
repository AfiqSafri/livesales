import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400 });
    }

    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        userType: true,
        status: true,
        bio: true,
        phone: true,
        address: true,
        companyName: true,
        businessType: true,
        profileImage: true,
        createdAt: true,
        isSubscribed: true,
        subscriptionStatus: true,
        subscriptionTier: true
      }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401 });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Account is deactivated. Please contact admin.' }), { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401 });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Login successful',
      user: userWithoutPassword
    }), { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 