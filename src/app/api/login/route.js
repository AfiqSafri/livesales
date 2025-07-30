import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401 });
    }
    const { password: _pw, ...userNoPw } = user;
    return new Response(JSON.stringify({ user: userNoPw }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 