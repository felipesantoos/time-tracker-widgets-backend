import { randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createToken() {
  // Primeiro, verifica se existe um usuário, se não, cria um
  let user = await prisma.user.findFirst();
  
  if (!user) {
    console.log('Criando usuário padrão...');
    user = await prisma.user.create({
      data: {
        email: 'user@example.com',
      },
    });
    console.log('Usuário criado:', user.id);
  }

  // Gera token
  const token = randomBytes(32).toString('hex');
  
  const accessToken = await prisma.accessToken.create({
    data: {
      userId: user.id,
      token,
    },
  });

  console.log('\n✅ Token criado com sucesso!');
  console.log('\nToken:', token);
  console.log('\nURLs dos widgets:');
  console.log(`Timer:    http://localhost:5173/timer?token=${token}`);
  console.log(`Projects: http://localhost:5173/projects?token=${token}`);
  console.log(`Sessions: http://localhost:5173/sessions?token=${token}`);
  console.log(`Reports:  http://localhost:5173/reports?token=${token}`);
  console.log(`Settings: http://localhost:5173/settings?token=${token}`);
  console.log('\n⚠️  Guarde este token em local seguro!');
  
  await prisma.$disconnect();
}

createToken().catch((error) => {
  console.error('Erro:', error);
  process.exit(1);
});

