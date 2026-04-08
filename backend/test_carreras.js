const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const careers = [
  { nombre: 'Ingeniería en Sistemas Computacionales', clave: 'ISC' },
  { nombre: 'Ingeniería Mecánica', clave: 'IM' },
  { nombre: 'Ingeniería Eléctrica', clave: 'IE' },
  { nombre: 'Ingeniería Electrónica', clave: 'IEL' },
  { nombre: 'Ingeniería Química', clave: 'IQ' },
  { nombre: 'Ingeniería Industrial', clave: 'II' },
  { nombre: 'Ingeniería Civil', clave: 'IC' },
  { nombre: 'Ingeniería en Gestión Empresarial', clave: 'IGE' },
  { nombre: 'Licenciatura en Administración', clave: 'LA' },
  { nombre: 'Contador Público', clave: 'CP' }
];

async function main() {
  await prisma.$executeRaw`DELETE FROM carreras`;
  await prisma.$executeRaw`ALTER TABLE carreras AUTO_INCREMENT = 1`;
  
  for (const c of careers) {
    await prisma.$executeRaw`INSERT INTO carreras (nombre, clave, created_at, updated_at) VALUES (${c.nombre}, ${c.clave}, NOW(), NOW())`;
  }
  
  const result = await prisma.$queryRaw`SELECT * FROM carreras`;
  console.log(result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
