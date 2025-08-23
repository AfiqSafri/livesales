import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { productId } = await req.json();
    
    if (!productId) {
      return new Response(JSON.stringify({ error: 'Product ID is required' }), { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            companyName: true,
            businessType: true,
            bio: true,
            phone: true,
            address: true,
            bankName: true,
            bankAccountNumber: true,
            bankAccountHolder: true,
            bankCode: true
          }
        },
        images: {
          select: {
            id: true,
            url: true
          }
        }
      }
    });

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }

    // Debug logging
    console.log('🔍 Product found:', {
      id: product.id,
      name: product.name,
      imagesCount: product.images ? product.images.length : 0,
      images: product.images
    });

    // Add default values for missing fields to prevent errors
    const enhancedProduct = {
      ...product,
      category: product.category || 'General',
      condition: product.condition || 'New',
      code: product.code || `PROD-${product.id}`,
      shippingPrice: product.shippingPrice || 0,
      quantity: product.quantity || 0,
      price: product.price || 0,
      description: product.description || 'No description available',
      images: product.images || [],
      seller: {
        ...product.seller,
        companyName: product.seller.companyName || '',
        businessType: product.seller.businessType || '',
        bio: product.seller.bio || '',
        phone: product.seller.phone || '',
        address: product.seller.address || '',
        bankName: product.seller.bankName || '',
        bankAccountNumber: product.seller.bankAccountNumber || '',
        bankAccountHolder: product.seller.bankAccountHolder || '',
        bankCode: product.seller.bankCode || ''
      }
    };

    console.log('✅ Enhanced product:', {
      id: enhancedProduct.id,
      name: enhancedProduct.name,
      imagesCount: enhancedProduct.images.length,
      images: enhancedProduct.images
    });

    return new Response(JSON.stringify({ product: enhancedProduct }), { status: 200 });
  } catch (error) {
    console.error('Error fetching product details:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch product details',
      details: error.message 
    }), { status: 500 });
  } finally {
    // Don't disconnect to maintain connection pooling
  }
} 