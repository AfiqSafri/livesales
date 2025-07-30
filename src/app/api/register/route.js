import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { 
      name, 
      email, 
      password, 
      userType, 
      bio, 
      phone, 
      address, 
      companyName, 
      businessType 
    } = await req.json();
    
    if (!name || !email || !password || !userType || !phone || !address) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), { status: 400 });
    }

    // Validate password strength
    if (password.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters long' }), { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), { status: 409 });
    }

    // Hash password (in production, use bcrypt)
    const hashedPassword = password; // For now, store as plain text. In production, hash it.

    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        userType, 
        bio, 
        phone, 
        address,
        companyName: companyName || null,
        businessType: businessType || null
      },
    });
    
    const { password: _pw, ...userNoPw } = user;
    return new Response(JSON.stringify({ user: userNoPw }), { status: 201 });
  } catch (e) {
    console.error('Registration error:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 