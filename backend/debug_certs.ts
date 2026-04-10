import prisma from './src/utils/prisma';

async function debugCertificados() {
  try {
    // 1. Ver total de certificados
    const allCerts = await prisma.certificados.findMany();
    console.log('Total Certificados en DB:', allCerts.length);

    // 2. Ver usuarios participantes
    const participants = await prisma.users.findMany({
      where: { role: 'PARTICIPANTE' },
      select: { id: true, name: true, email: true }
    });
    console.log('Total Participantes:', participants.length);

    if (participants.length > 0) {
      for (const p of participants) {
        const userCerts = await prisma.certificados.findMany({
          where: { user_id: p.id }
        });
        console.log(`Usuario ${p.name} (ID: ${p.id.toString()}) tiene ${userCerts.length} certificados.`);
      }
    }

  } catch (e) {
    console.error('Error en debug:', e);
  } finally {
    await prisma.$disconnect();
  }
}

debugCertificados();
