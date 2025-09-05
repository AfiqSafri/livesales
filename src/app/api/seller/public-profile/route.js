import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('id');
    
    if (!sellerId) {
      return new Response(JSON.stringify({ error: 'Missing sellerId' }), { status: 400 });
    }
    
    const seller = await prisma.user.findUnique({ 
      where: { id: Number(sellerId), userType: 'seller' } 
    });
    
    if (!seller) {
      return new Response(JSON.stringify({ error: 'Seller not found' }), { status: 404 });
    }
    
    const { password: _pw, ...sellerNoPw } = seller;
    const products = await prisma.product.findMany({ 
      where: { sellerId: Number(sellerId) } 
    });
    
    return new Response(JSON.stringify({ seller: sellerNoPw, products }), { status: 200 });
  } catch (e) {
    console.error('Error fetching seller public profile:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { sellerId } = await req.json();
    if (!sellerId) {
      return new Response(JSON.stringify({ error: 'Missing sellerId' }), { status: 400 });
    }
    const seller = await prisma.user.findUnique({ where: { id: Number(sellerId), userType: 'seller' } });
    if (!seller) {
      return new Response(JSON.stringify({ error: 'Seller not found' }), { status: 404 });
    }
    const { password: _pw, ...sellerNoPw } = seller;
    const products = await prisma.product.findMany({ where: { sellerId: Number(sellerId) } });
    return new Response(JSON.stringify({ seller: sellerNoPw, products }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
} 