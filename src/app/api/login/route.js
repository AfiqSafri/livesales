import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() },
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
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json({ error: 'Account is deactivated. Please contact admin.' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ 
      success: true,
      message: 'Login successful',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 