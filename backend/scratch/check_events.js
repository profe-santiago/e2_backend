
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const eventos = await prisma.eventos.findMany();
  console.log('Eventos:', JSON.stringify(eventos, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
