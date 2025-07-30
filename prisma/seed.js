require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding users...');
  try {
    const result = await prisma.user.createMany({
      data: [
        {
          name: 'Demo Seller 1',
          email: 'seller1@example.com',
          password: 'password123',
          userType: 'seller',
          bio: 'I sell awesome products!',
        },
        {
          name: 'Demo Seller 2',
          email: 'seller2@example.com',
          password: 'password456',
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
  console.log('Seeded sellers!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 