
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkTeam() {
  const teamName = 'CodeBreakers';
  console.log(`--- Checking projects for team: ${teamName} ---`);
  
  const team = await prisma.equipos.findFirst({
    where: { nombre: { contains: teamName } },
    include: {
      proyectos: {
        include: { eventos: true }
      }
    }
  });

  if (!team) {
    console.log('Team not found');
  } else {
    console.log(`Team: ${team.nombre} (ID: ${team.id})`);
    console.log('Projects:');
    team.proyectos.forEach(p => {
      console.log(` - ID: ${p.id}, Event: ${p.eventos?.nombre} (Event ID: ${p.evento_id})`);
    });
  }

  await prisma.$disconnect();
}

checkTeam();
