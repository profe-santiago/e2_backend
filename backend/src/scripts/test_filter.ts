
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  console.log('--- Testing Team Filter by Event ---');
  
  // 1. Get all events
  const events = await prisma.eventos.findMany();
  console.log('Events in DB:', events.map(e => ({ id: e.id.toString(), nombre: e.nombre })));

  if (events.length > 0) {
    const eventId = events[0].id;
    console.log(`Filtering teams by Event ID: ${eventId}`);

    const teamsCount = await prisma.equipos.count({
      where: {
        proyectos: {
          some: {
            evento_id: eventId
          }
        }
      }
    });
    console.log('Teams found (count):', teamsCount);

    const teams = await prisma.equipos.findMany({
      where: {
        proyectos: {
          some: {
            evento_id: eventId
          }
        }
      },
      include: {
        proyectos: true
      }
    });
    console.log('Teams found (list):', teams.length);
  }

  await prisma.$disconnect();
}

test();
