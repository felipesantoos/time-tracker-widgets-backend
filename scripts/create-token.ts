import { randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createToken() {
  // First, check if a user exists, if not, create one
  let user = await prisma.user.findFirst();
  
  if (!user) {
    console.log('Creating default user...');
    user = await prisma.user.create({
      data: {
        email: 'user@example.com',
      },
    });
    console.log('User created:', user.id);
  }

  // Generate token
  const token = randomBytes(32).toString('hex');
  
  const accessToken = await prisma.accessToken.create({
    data: {
      userId: user.id,
      token,
    },
  });

  console.log('\n✅ Token created successfully!');
  console.log('\nToken:', token);
  console.log('\nWidget URLs:');
  console.log(`Timer:    http://localhost:5173/timer?token=${token}`);
  console.log(`Projects: http://localhost:5173/projects?token=${token}`);
  console.log(`Sessions: http://localhost:5173/sessions?token=${token}`);
  console.log(`Reports:  http://localhost:5173/reports?token=${token}`);
  console.log(`Settings: http://localhost:5173/settings?token=${token}`);
  console.log('\n⚠️  Keep this token in a safe place!');
  
  await prisma.$disconnect();
}

createToken().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

