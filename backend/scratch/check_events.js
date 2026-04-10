
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEvents() {
  try {
    const allEvents = await prisma.eventos.findMany({
      orderBy: { created_at: 'desc' }
    });
    
    console.log(`Total Events in DB: ${allEvents.length}`);
    
    const now = new Date();
    const active = allEvents.filter(e => new Date(e.fecha_fin) >= now);
    const finished = allEvents.filter(e => new Date(e.fecha_fin) < now);
    
    console.log(`Active (fecha_fin >= now): ${active.length}`);
    console.log(`Finished (fecha_fin < now): ${finished.length}`);
    
    allEvents.forEach((e, i) => {
      console.log(`${i+1}. ID: ${e.id}, Nombre: ${e.nombre}, Fin: ${e.fecha_fin}, Active: ${new Date(e.fecha_fin) >= now}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkEvents();
