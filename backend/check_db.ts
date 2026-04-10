import prisma from './src/utils/prisma';

async function check() {
  try {
    const certs = await prisma.certificados.findMany();
    console.log('Total certs:', certs.length);
    console.log('Sample cert:', certs[0] ? { ...certs[0], id: certs[0].id.toString(), user_id: certs[0].user_id.toString() } : 'None');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
