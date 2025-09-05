require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL);
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const seller1Password = await bcrypt.hash('password123', 10);
    const seller2Password = await bcrypt.hash('password456', 10);
    const buyerPassword = await bcrypt.hash('buyer123', 10);

    console.log('👤 Creating users...');
    
    // Create users
    const users = await prisma.user.createMany({
      data: [
        {
          name: 'Admin User',
          email: 'admin@livesalez.com',
          password: adminPassword,
          userType: 'admin',
          status: 'active',
          bio: 'System Administrator for Livesalez Platform',
          phone: '+60123456789',
          address: 'Kuala Lumpur, Malaysia',
          isSubscribed: true,
          subscriptionStatus: 'active',
          subscriptionTier: 'lifetime',
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        },
        {
          name: 'John Smith',
          email: 'john@example.com',
          password: seller1Password,
          userType: 'seller',
          status: 'active',
          bio: 'Professional electronics seller with 5+ years experience. Specializing in smartphones, laptops, and accessories.',
          phone: '+60123456790',
          address: 'Petaling Jaya, Selangor',
          companyName: 'TechHub Solutions',
          businessType: 'Electronics Retail',
          isSubscribed: true,
          subscriptionStatus: 'active',
          subscriptionTier: 'premium',
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          bankAccountHolder: 'John Smith',
          bankAccountNumber: '1234567890',
          bankCode: 'MBB0228',
          bankName: 'Maybank',
        },
        {
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          password: seller2Password,
          userType: 'seller',
          status: 'active',
          bio: 'Fashion enthusiast selling trendy clothing and accessories. Quality guaranteed!',
          phone: '+60123456791',
          address: 'Subang Jaya, Selangor',
          companyName: 'Fashion Forward',
          businessType: 'Fashion Retail',
          isSubscribed: true,
          subscriptionStatus: 'active',
          subscriptionTier: 'basic',
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          bankAccountHolder: 'Sarah Johnson',
          bankAccountNumber: '0987654321',
          bankCode: 'BCBB0235',
          bankName: 'CIMB Bank',
        },
        {
          name: 'Mike Chen',
          email: 'mike@example.com',
          password: buyerPassword,
          userType: 'buyer',
          status: 'active',
          bio: 'Tech enthusiast and frequent online shopper',
          phone: '+60123456792',
          address: 'Klang, Selangor',
        },
        {
          name: 'Lisa Wong',
          email: 'lisa@example.com',
          password: buyerPassword,
          userType: 'buyer',
          status: 'active',
          bio: 'Fashion lover and bargain hunter',
          phone: '+60123456793',
          address: 'Cheras, Kuala Lumpur',
        },
      ],
      skipDuplicates: true,
    });

    console.log('✅ Users created:', users.count);

    // Get the created users to create products
    const createdUsers = await prisma.user.findMany({
      where: {
        userType: 'seller'
      }
    });

    console.log('📦 Creating sample products...');

    // Create sample products
    const products = await prisma.product.createMany({
      data: [
        {
          name: 'iPhone 15 Pro Max 256GB',
          description: 'Latest iPhone with titanium design, A17 Pro chip, and advanced camera system. Perfect for photography and gaming.',
          price: 4999.00,
          image: '/img/placeholder-product.svg',
          sellerId: createdUsers[0].id,
          quantity: 5,
          shippingPrice: 15.00,
          hasDiscount: true,
          discountPercentage: 10.0,
          discountType: 'percentage',
          discountEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
        {
          name: 'MacBook Air M2 13-inch',
          description: 'Powerful laptop with M2 chip, 8GB RAM, 256GB SSD. Perfect for work and creative projects.',
          price: 4299.00,
          image: '/img/placeholder-product.svg',
          sellerId: createdUsers[0].id,
          quantity: 3,
          shippingPrice: 20.00,
          hasDiscount: false,
        },
        {
          name: 'Samsung Galaxy S24 Ultra',
          description: 'Premium Android smartphone with S Pen, 200MP camera, and AI features.',
          price: 3999.00,
          image: '/img/placeholder-product.svg',
          sellerId: createdUsers[0].id,
          quantity: 8,
          shippingPrice: 15.00,
          hasDiscount: true,
          discountPercentage: 5.0,
          discountType: 'percentage',
          discountEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        },
        {
          name: 'Designer Handbag - Black Leather',
          description: 'Elegant black leather handbag perfect for office and evening wear. High quality materials.',
          price: 299.00,
          image: '/img/placeholder-product.svg',
          sellerId: createdUsers[1].id,
          quantity: 10,
          shippingPrice: 10.00,
          hasDiscount: true,
          discountPercentage: 15.0,
          discountType: 'percentage',
          discountEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        },
        {
          name: 'Summer Dress Collection',
          description: 'Beautiful summer dresses in various colors and sizes. Lightweight and comfortable.',
          price: 89.00,
          image: '/img/placeholder-product.svg',
          sellerId: createdUsers[1].id,
          quantity: 20,
          shippingPrice: 8.00,
          hasDiscount: false,
        },
        {
          name: 'Wireless Bluetooth Headphones',
          description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
          price: 199.00,
          image: '/img/placeholder-product.svg',
          sellerId: createdUsers[0].id,
          quantity: 15,
          shippingPrice: 12.00,
          hasDiscount: true,
          discountPercentage: 20.0,
          discountType: 'percentage',
          discountEndDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        },
      ],
      skipDuplicates: true,
    });

    console.log('✅ Products created:', products.count);

    // Get buyers for sample orders
    const buyers = await prisma.user.findMany({
      where: {
        userType: 'buyer'
      }
    });

    console.log('🛒 Creating sample orders...');

    // Create sample orders
    const orders = await prisma.order.createMany({
      data: [
        {
          productId: 1,
          buyerId: buyers[0].id,
          buyerName: buyers[0].name,
          buyerEmail: buyers[0].email,
          quantity: 1,
          shippingAddress: buyers[0].address,
          phone: buyers[0].phone,
          totalAmount: 4514.10, // Price with discount and shipping
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: 'qr_code',
        },
        {
          productId: 4,
          buyerId: buyers[1].id,
          buyerName: buyers[1].name,
          buyerEmail: buyers[1].email,
          quantity: 2,
          shippingAddress: buyers[1].address,
          phone: buyers[1].phone,
          totalAmount: 518.20, // Price with discount and shipping
          status: 'paid',
          paymentStatus: 'completed',
          paymentMethod: 'chip',
          paymentDate: new Date(),
        },
        {
          productId: 6,
          buyerId: buyers[0].id,
          buyerName: buyers[0].name,
          buyerEmail: buyers[0].email,
          quantity: 1,
          shippingAddress: buyers[0].address,
          phone: buyers[0].phone,
          totalAmount: 171.20, // Price with discount and shipping
          status: 'pending',
          paymentStatus: 'pending_review',
          paymentMethod: 'qr_code',
          receiptUrl: '/uploads/receipts/sample_receipt.jpg',
        },
      ],
      skipDuplicates: true,
    });

    console.log('✅ Orders created:', orders.count);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   👤 Users: 5 (1 Admin, 2 Sellers, 2 Buyers)');
    console.log('   📦 Products: 6 (Electronics & Fashion)');
    console.log('   🛒 Orders: 3 (Various payment statuses)');
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@livesalez.com / admin123');
    console.log('   Seller 1: john@example.com / password123');
    console.log('   Seller 2: sarah@example.com / password456');
    console.log('   Buyer 1: mike@example.com / buyer123');
    console.log('   Buyer 2: lisa@example.com / buyer123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 