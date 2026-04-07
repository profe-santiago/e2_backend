import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.proyectos.deleteMany()
  await prisma.equipos.deleteMany()
  await prisma.eventos.deleteMany()
  
  // ─── EVENTOS ───
  const eventos = await Promise.all([
    prisma.eventos.create({
      data: {
        nombre: 'Hackathon DELTOS 2026',
        descripcion: 'Competencia de desarrollo de software en equipos multidisciplinarios. Los participantes tendrán 48 horas para crear soluciones innovadoras.',
        fecha_inicio: new Date('2026-04-10T08:00:00'),
        fecha_fin: new Date('2026-04-12T20:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Expo Tecnológica 2026',
        descripcion: 'Exhibición de proyectos tecnológicos desarrollados durante el semestre. Abierto al público general y evaluado por jueces externos.',
        fecha_inicio: new Date('2026-05-15T09:00:00'),
        fecha_fin: new Date('2026-05-17T18:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Rally de Innovación 2026',
        descripcion: 'Competencia internacional de innovación donde equipos resuelven retos reales de la industria en 28 horas continuas.',
        fecha_inicio: new Date('2026-06-20T07:00:00'),
        fecha_fin: new Date('2026-06-21T11:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Feria de Ciencias TecNM',
        descripcion: 'Presentación de proyectos de investigación y desarrollo tecnológico del Tecnológico Nacional de México.',
        fecha_inicio: new Date('2026-03-01T10:00:00'),
        fecha_fin: new Date('2026-03-03T17:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Code Jam Primavera',
        descripcion: 'Competencia de programación competitiva con problemas de algoritmia y estructura de datos.',
        fecha_inicio: new Date('2026-04-01T14:00:00'),
        fecha_fin: new Date('2026-04-06T23:59:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Feria de Emprendimiento 2026',
        descripcion: 'Exposición de proyectos de emprendimiento tecnológico para búsqueda de inversión.',
        fecha_inicio: new Date('2026-08-10T09:00:00'),
        fecha_fin: new Date('2026-08-11T16:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Torneo de Robótica Educativa',
        descripcion: 'Competencia nacional de robots resuelve laberintos y seguidores de línea.',
        fecha_inicio: new Date('2026-09-05T08:00:00'),
        fecha_fin: new Date('2026-09-07T18:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Simposio de Inteligencia Artificial',
        descripcion: 'Ciclo de conferencias y presentación de proyectos sobre aprendizaje profundo y redes neuronales.',
        fecha_inicio: new Date('2026-10-12T10:00:00'),
        fecha_fin: new Date('2026-10-14T17:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Hackathon Ambiental GreenCode',
        descripcion: 'Desarrollo de software enfocado a la mejora y el cuidado del medio ambiente local.',
        fecha_inicio: new Date('2026-11-20T08:00:00'),
        fecha_fin: new Date('2026-11-22T20:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Concurso de Ciberseguridad Defcon-T',
        descripcion: 'Retos de captura la bandera (CTF) y auditorías de seguridad web en tiempo real.',
        fecha_inicio: new Date('2026-12-01T09:00:00'),
        fecha_fin: new Date('2026-12-02T19:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Expo Videojuegos 2027',
        descripcion: 'Competencia universitaria de desarrollo de motores gráficos y videojuegos indie.',
        fecha_inicio: new Date('2027-01-15T10:00:00'),
        fecha_fin: new Date('2027-01-17T18:00:00'),
        updated_at: new Date()
      }
    }),
    prisma.eventos.create({
      data: {
        nombre: 'Cumbre de Realidad Virtual Tec',
        descripcion: 'Presentación de experiencias y mundos virtuales creados por estudiantes de últimos semestres.',
        fecha_inicio: new Date('2027-02-20T08:00:00'),
        fecha_fin: new Date('2027-02-21T18:00:00'),
        updated_at: new Date()
      }
    }),
  ])

  console.log(`✅ ${eventos.length} eventos creados`)

  // ─── EQUIPOS ───
  const equipos = await Promise.all([
    prisma.equipos.create({
      data: {
        nombre: 'CodeBreakers',
        max_programadores: 2,
        max_disenadores: 1,
        max_testers: 1,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'ByteForce',
        max_programadores: 2,
        max_disenadores: 1,
        max_testers: 1,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'NexGen Devs',
        max_programadores: 2,
        max_disenadores: 1,
        max_testers: 1,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'TechWizards',
        max_programadores: 2,
        max_disenadores: 1,
        max_testers: 1,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'InnovaTech',
        max_programadores: 3,
        max_disenadores: 1,
        max_testers: 1,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'Alpha Dynamics',
        max_programadores: 2,
        max_disenadores: 2,
        max_testers: 1,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'Cyber Punks',
        max_programadores: 3,
        max_disenadores: 0,
        max_testers: 2,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'Quantum Coders',
        max_programadores: 2,
        max_disenadores: 1,
        max_testers: 1,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'Data Miners',
        max_programadores: 2,
        max_disenadores: 1,
        max_testers: 0,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'Cloud Surfers',
        max_programadores: 2,
        max_disenadores: 1,
        max_testers: 1,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'Pixel Perfect',
        max_programadores: 1,
        max_disenadores: 3,
        max_testers: 1,
        updated_at: new Date()
      }
    }),
    prisma.equipos.create({
      data: {
        nombre: 'Bug Smashers',
        max_programadores: 1,
        max_disenadores: 0,
        max_testers: 4,
        updated_at: new Date()
      }
    }),
  ])

  console.log(`✅ ${equipos.length} equipos creados`)

  // ─── PROYECTOS ───
  const proyectos = await Promise.all([
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[0].id,
        evento_id: eventos[0].id,
        nombre: 'EcoTrack - Monitor Ambiental IoT',
        descripcion: 'Sistema de monitoreo ambiental en tiempo real usando sensores IoT. Mide temperatura, humedad, calidad del aire y niveles de ruido en campus universitarios.',
        repositorio_url: 'https://github.com/codebreakers/ecotrack',
        updated_at: new Date()
      }
    }),
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[1].id,
        evento_id: eventos[0].id,
        nombre: 'MediConnect - Telemedicina Rural',
        descripcion: 'Plataforma de telemedicina enfocada en comunidades rurales con conectividad limitada. Incluye diagnóstico asistido por IA y expedientes digitales.',
        repositorio_url: 'https://github.com/byteforce/mediconnect',
        updated_at: new Date()
      }
    }),
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[2].id,
        evento_id: eventos[0].id,
        nombre: 'SmartPark - Estacionamiento Inteligente',
        descripcion: 'App móvil y sistema de sensores para localizar espacios de estacionamiento disponibles en tiempo real dentro del campus.',
        repositorio_url: 'https://github.com/nexgendevs/smartpark',
        updated_at: new Date()
      }
    }),
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[3].id,
        evento_id: eventos[0].id,
        nombre: 'LearnPath - Plataforma Educativa Adaptativa',
        descripcion: 'Sistema de aprendizaje adaptativo que personaliza el contenido educativo según el estilo de aprendizaje y progreso del estudiante usando ML.',
        repositorio_url: 'https://github.com/techwizards/learnpath',
        updated_at: new Date()
      }
    }),
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[4].id,
        evento_id: eventos[0].id,
        nombre: 'AgroVision - Análisis de Cultivos por Drones',
        descripcion: 'Solución de agricultura de precisión que utiliza drones y visión computacional para analizar el estado de salud de los cultivos.',
        repositorio_url: 'https://github.com/innovatech/agrovision',
        updated_at: new Date()
      }
    }),
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[0].id,
        evento_id: eventos[0].id,
        nombre: 'TaskFlow - Gestor de Tareas con IA',
        descripcion: 'Herramienta de gestión de proyectos que usa inteligencia artificial para priorizar tareas y predecir tiempos de entrega.',
        repositorio_url: 'https://github.com/codebreakers/taskflow',
        updated_at: new Date()
      }
    }),
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[1].id,
        evento_id: eventos[2].id,
        nombre: 'WaterGuard - Monitoreo Hídrico',
        descripcion: 'Sistema de monitoreo de calidad del agua en tiempo real para comunidades con problemas de contaminación hídrica.',
        repositorio_url: 'https://github.com/byteforce/waterguard',
        updated_at: new Date()
      }
    }),
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[2].id,
        evento_id: eventos[4].id,
        nombre: 'CyberShield - Seguridad en Redes',
        descripcion: 'Herramienta de análisis de vulnerabilidades y detección de intrusiones para redes empresariales pequeñas y medianas.',
        repositorio_url: 'https://github.com/nexgendevs/cybershield',
        updated_at: new Date()
      }
    }),
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[5].id, // Alpha Dynamics
        evento_id: eventos[5].id,
        nombre: 'AlphaTrader - Algoritmos de Bolsa',
        descripcion: 'Plataforma de simulación de trading automático usando estrategias de machine learning.',
        repositorio_url: 'https://github.com/alphadynamics/alphatrader',
        updated_at: new Date()
      }
    }),
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[6].id, // Cyber Punks
        evento_id: eventos[6].id,
        nombre: 'Neon City - Metaverso Independiente',
        descripcion: 'Videojuego multijugador masivo en un entorno cyberpunk con economía propia.',
        repositorio_url: 'https://github.com/cyberpunks/neoncity',
        updated_at: new Date()
      }
    }),
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[7].id, // Quantum Coders
        evento_id: eventos[7].id,
        nombre: 'Q-Sim - Emulador Cuántico',
        descripcion: 'Emulador de computadora cuántica de código abierto para fines educativos.',
        repositorio_url: 'https://github.com/quantumcoders/qsim',
        updated_at: new Date()
      }
    }),
    prisma.proyectos.create({
      data: {
        equipo_id: equipos[8].id, // Data Miners
        evento_id: eventos[8].id,
        nombre: 'GeoPredict - Predicción de Sismos',
        descripcion: 'Análisis de datos sísmicos históricos para detectar patrones y emitir pre-alertas de actividad volcánica.',
        repositorio_url: 'https://github.com/dataminers/geopredict',
        updated_at: new Date()
      }
    }),
  ])

  console.log(`✅ ${proyectos.length} proyectos creados`)

  // ─── CALIFICACIONES ───
  let juez = await prisma.users.findFirst()

  if (juez) {
    // Check si hay criterios para el evento 0
    let criteriosEvento0 = await prisma.evaluacion_criterios.findMany({ where: { evento_id: eventos[0].id } })
    if (criteriosEvento0.length === 0) {
      await prisma.evaluacion_criterios.createMany({
        data: [
          { evento_id: eventos[0].id, nombre: 'Innovación', ponderacion: 30 },
          { evento_id: eventos[0].id, nombre: 'Implementación', ponderacion: 40 },
          { evento_id: eventos[0].id, nombre: 'Presentación', ponderacion: 30 },
        ]
      })
      criteriosEvento0 = await prisma.evaluacion_criterios.findMany({ where: { evento_id: eventos[0].id } })
    }

    const proyectosEvento0 = proyectos.filter(p => p.evento_id === eventos[0].id)
    
    // Puntuaciones base para cada uno (para asegurar diferencias y ranking claro)
    const puntuaciones = [98, 92, 85, 78, 65]
    
    for (let i = 0; i < proyectosEvento0.length; i++) {
      const proyecto = proyectosEvento0[i]
      const baseScore = puntuaciones[i % puntuaciones.length]
      
      for (const criterio of criteriosEvento0) {
        const score = Math.min(100, Math.max(0, baseScore + (Math.random() * 6 - 3)))
        await prisma.evaluaciones.create({
          data: {
            proyecto_id: proyecto.id,
            juez_id: juez.id,
            criterio_id: criterio.id,
            puntuacion: parseFloat(score.toFixed(2)),
            comentario: 'Proyecto calificado desde semilla.',
            created_at: new Date()
          }
        })
      }
    }
    console.log(`✅ Evaluaciones creadas para los ${proyectosEvento0.length} proyectos del evento 0`)
  }

  console.log('\n🎉 Seed completado exitosamente!')
  console.log(`   📅 ${eventos.length} eventos`)
  console.log(`   👥 ${equipos.length} equipos`)
  console.log(`   📁 ${proyectos.length} proyectos`)
}

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
