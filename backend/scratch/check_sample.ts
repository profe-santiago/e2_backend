import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany({ take: 5 });
  const events = await prisma.eventos.findMany({ take: 5 });
  
  console.log('--- SAMPLE DATA ---');
  console.log('Users:', users.map(u => ({ id: u.id.toString(), name: u.name })));
  console.log('Events:', events.map(e => ({ id: e.id.toString(), name: e.nombre })));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
