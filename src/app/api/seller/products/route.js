import { PrismaClient } from '@prisma/client';

// Create a single Prisma instance with better connection handling
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable to prevent multiple instances
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.prisma;
}

// Global variable to track connection status
let isConnected = false;

export async function POST(req) {
  try {
    const { sellerId, userId } = await req.json();
    const id = sellerId || userId;
    
    console.log('API Request - sellerId:', sellerId, 'userId:', userId, 'id:', id);
    
    if (!id) {
      return new Response(JSON.stringify({ 
        error: 'Missing sellerId or userId',
        details: 'Seller ID is required to fetch products'
      }), { status: 400 });
    }
    
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set');
      return new Response(JSON.stringify({ 
        error: 'Database configuration error',
        details: 'Database connection string is not configured'
      }), { status: 500 });
    }
    
    // Test database connection with timeout and connection pooling
    try {
      if (!isConnected) {
        await Promise.race([
          prisma.$connect(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database connection timeout')), 10000)
          )
        ]);
        isConnected = true;
        console.log('Database connected successfully');
      }
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      isConnected = false;
      
      // Return 503 for connection issues to indicate temporary unavailability
      return new Response(JSON.stringify({ 
        error: 'Database connection failed',
        details: 'Database is temporarily unavailable. Please try again.',
        code: 'P1001',
        retryable: true
      }), { status: 503 });
    }
    
    // Execute query with timeout
    const products = await Promise.race([
      prisma.product.findMany({ 
        where: { sellerId: Number(id) },
        include: { 
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
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 15000)
      )
    ]);
    
    // Validate the response
    if (!Array.isArray(products)) {
      console.error('Invalid products response:', products);
      throw new Error('Invalid database response format');
    }
    
    console.log('Products found:', products.length);
    
    return new Response(JSON.stringify({ products }), { status: 200 });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Handle specific Prisma errors
    if (error.code === 'P1001') {
      return new Response(JSON.stringify({ 
        error: 'Database connection failed',
        details: 'Database server is not reachable. Please try again.',
        code: error.code
      }), { status: 503 }); // Service Unavailable
    }
    
    if (error.code === 'P2002') {
      return new Response(JSON.stringify({ 
        error: 'Database constraint violation',
        details: 'A unique constraint was violated',
        code: error.code
      }), { status: 400 });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), { status: 500 });
  } finally {
    // Don't disconnect to maintain connection pooling
    // The connection will be managed by Prisma automatically
  }
} 