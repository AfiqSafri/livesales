import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { name, email, password, userType = 'buyer' } = await req.json();
    
    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: 'Name, email, and password are required' }), { status: 400 });
    }

    // Validate user type
    if (!['buyer', 'seller', 'admin'].includes(userType)) {
      return new Response(JSON.stringify({ error: 'Invalid user type' }), { status: 400 });
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

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userType,
        status: 'active'
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return new Response(JSON.stringify({ 
      success: true,
      message: 'User registered successfully',
      user: userWithoutPassword
    }), { status: 201 });

  } catch (error) {
    console.error('Error registering user:', error);
    return new Response(JSON.stringify({ error: 'Failed to register user' }), { status: 500 });
  }
} 