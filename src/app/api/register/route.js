import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { 
      name, 
      email, 
      password, 
      userType = 'seller',
      phone,
      address,
      bio,
      companyName,
      businessType
    } = await req.json();
    
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Validate user type
    if (!['buyer', 'seller', 'admin'].includes(userType)) {
      return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate trial dates
    const now = new Date();
    const trialEndDate = new Date(now.getTime() + (3 * 30 * 24 * 60 * 60 * 1000)); // 3 months

    // Create the user with all profile fields
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        userType,
        status: 'active',
        phone: phone || null,
        address: address || null,
        bio: bio || null,
        companyName: companyName || null,
        businessType: businessType || null,
        // Set up trial subscription
        isSubscribed: true,
        subscriptionTier: 'trial',
        subscriptionStatus: 'trial',
        isTrialActive: true,
        trialStartDate: now,
        trialEndDate: trialEndDate,
        subscriptionStartDate: now,
        subscriptionEndDate: trialEndDate
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({ 
      success: true,
      message: 'Seller account created successfully! Your 3-month free trial has started.',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 