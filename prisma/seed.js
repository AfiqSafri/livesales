require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL);
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding users...');
  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const seller1Password = await bcrypt.hash('password123', 10);
    const seller2Password = await bcrypt.hash('password456', 10);

    const result = await prisma.user.createMany({
      data: [
        {
          name: 'Admin User',
          email: 'admin@livesalez.com',
          password: adminPassword,
          userType: 'admin',
          status: 'active',
          bio: 'System Administrator',
          isSubscribed: true,
          subscriptionStatus: 'active',
          subscriptionTier: 'lifetime',
        },
        {
          name: 'Demo Seller 1',
          email: 'seller1@example.com',
          password: seller1Password,
          userType: 'seller',
          bio: 'I sell awesome products!',
        },
        {
          name: 'Demo Seller 2',
          email: 'seller2@example.com',
          password: seller2Password,
          userType: 'seller',
          bio: 'Another seller!',
        },
      ],
      skipDuplicates: true,
    });
    console.log('User creation result:', result);
  } catch (error) {
    console.error('Error creating users:', error);
  }
  console.log('Seeded users including admin!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 