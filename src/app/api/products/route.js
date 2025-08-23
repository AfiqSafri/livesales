import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    
    console.log('🔍 Products API called with params:', { ids, url: request.url });
    
    let whereClause = {
      quantity: {
        gt: 0 // Only show products with stock
      }
    };
    
    // If specific IDs are requested, filter by them
    if (ids) {
      const idArray = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      console.log('🔍 Parsed IDs:', idArray);
      if (idArray.length > 0) {
        whereClause.id = {
          in: idArray
        };
      }
    }
    
    console.log('🔍 Final where clause:', JSON.stringify(whereClause, null, 2));
    
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            companyName: true,
            businessType: true,
            bio: true
          }
        },
        images: {
          select: {
            id: true,
            url: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📦 Products API: Found ${products.length} products${ids ? ` for IDs: ${ids}` : ''}`);
    if (ids) {
      console.log('🔍 Requested IDs:', ids);
      console.log('🔍 Found product IDs:', products.map(p => p.id));
      console.log('🔍 Found product names:', products.map(p => p.name));
    }

    return new Response(JSON.stringify({ products }), { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    console.error('❌ Error stack:', error.stack);
    return new Response(JSON.stringify({ error: 'Failed to fetch products', details: error.message }), { status: 500 });
  }
} 