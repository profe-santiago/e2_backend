import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.count();
  const events = await prisma.eventos.count();
  const teams = await prisma.equipos.count();
  
  console.log('--- DATABASE DATA CHECK ---');
  console.log('Users:', users);
  console.log('Events:', events);
  console.log('Teams:', teams);
  console.log('---------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
