import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';
import prisma from '../../utils/prisma';

const router = Router();

/**
 * @swagger
 * /api/participante/dashboard:
 *   get:
 *     summary: Obtener datos del dashboard del participante
 *     tags: [Participante]
 *     security:
 *       - bearerAuth: []
 */
router.get('/dashboard', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    // 1. Get user info (carrera etc)
    const user = await prisma.users.findUnique({ where: { id: BigInt(userId) } });
    const registrado = !!(user?.carrera && user?.no_control && user?.telefono);

    let equipo: any = null;
    let proyecto: any = null;
    let miembros: any[] = [];
    let puntajeTotal = 0;
    let chartLabels: string[] = [];
    let chartData: number[] = [];
    let evento_inscrito: any = null;

    // 2. Find team via equipo_miembros
    const membership = await prisma.equipo_miembros.findFirst({
      where: { user_id: BigInt(userId) },
      include: { equipos: true }
    });

    if (membership) {
      equipo = {
        id: Number(membership.equipos.id),
        nombre: membership.equipos.nombre
      };

      // 3. Get team members
      const miembrosData = await prisma.equipo_miembros.findMany({
        where: { equipo_id: membership.equipo_id },
        include: { users: { select: { id: true, name: true } } }
      });
      miembros = miembrosData.map(m => ({
        id: Number(m.users.id),
        nombre: m.users.name,
        perfil: m.rol || 'Miembro',
        es_lider: m.rol === 'LIDER'
      }));

      // 4. Find the team's project
      const proyectoData = await prisma.proyectos.findFirst({
        where: { equipo_id: membership.equipo_id },
        include: { eventos: true }
      });

      if (proyectoData) {
        proyecto = {
          id: Number(proyectoData.id),
          nombre: proyectoData.nombre,
          descripcion: proyectoData.descripcion,
          repositorio_url: proyectoData.repositorio_url || null,
          evento_id: Number(proyectoData.evento_id)
        };

        // 5. Get scores by criteria
        const evaluaciones = await prisma.evaluaciones.findMany({
          where: { proyecto_id: proyectoData.id },
          include: { evaluacion_criterios: true }
        });

        const scoresByCriteria: Record<string, { sum: number; count: number }> = {};
        for (const ev of evaluaciones) {
          const nombre = ev.evaluacion_criterios?.nombre || 'Criterio';
          if (!scoresByCriteria[nombre]) {
            scoresByCriteria[nombre] = { sum: 0, count: 0 };
          }
          scoresByCriteria[nombre].sum += Number(ev.puntuacion);
          scoresByCriteria[nombre].count += 1;
        }

        chartLabels = Object.keys(scoresByCriteria);
        chartData = chartLabels.map(label => {
          const s = scoresByCriteria[label];
          return s.count > 0 ? Math.round(s.sum / s.count) : 0;
        });
        puntajeTotal = chartData.length > 0
          ? Math.round(chartData.reduce((a, b) => a + b, 0) / chartData.length)
          : 0;

        // 6. Event info
        if (proyectoData.eventos) {
          evento_inscrito = {
            id: Number(proyectoData.eventos.id),
            nombre: proyectoData.eventos.nombre,
            descripcion: proyectoData.eventos.descripcion,
            fecha_inicio: proyectoData.eventos.fecha_inicio,
            fecha_fin: proyectoData.eventos.fecha_fin
          };
        }
      }
    }

    // 7. Pending invitations (equipo_interacciones with tipo=INVITACION and estado=PENDIENTE)
    let invitaciones: any[] = [];
    const invRows = await prisma.equipo_interacciones.findMany({
      where: {
        user_id: BigInt(userId),
        tipo: 'INVITACION',
        estado: 'PENDIENTE'
      },
      include: { equipos: true, perfiles: true }
    });
    invitaciones = invRows.map((inv: any) => ({
      id: Number(inv.id),
      equipo: { id: Number(inv.equipos.id), nombre: inv.equipos.nombre },
      rol: inv.perfiles?.nombre || 'Miembro',
      estado: inv.estado
    }));

    // 8. Upcoming events
    const eventosData = await prisma.eventos.findMany({
      where: { fecha_fin: { gte: new Date() } },
      orderBy: { fecha_inicio: 'asc' },
      take: 5
    });
    const eventos = eventosData.map(e => ({
      id: Number(e.id),
      nombre: e.nombre,
      descripcion: e.descripcion,
      fecha_inicio: e.fecha_inicio,
      fecha_fin: e.fecha_fin
    }));

    res.json({
      success: true,
      data: {
        registrado,
        equipo,
        proyecto,
        miembros,
        puntajeTotal,
        chartLabels,
        chartData,
        invitaciones,
        eventos,
        evento_inscrito,
        user_info: {
          name: user?.name,
          email: user?.email,
          no_control: user?.no_control,
          carrera: user?.carrera,
          telefono: user?.telefono
        },
        es_lider: miembros.some(m => m.id === Number(userId) && m.es_lider)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/dashboard/registro-inicial:
 *   get:
 *     summary: Obtener datos para el registro inicial
 *     tags: [Participante]
 */
router.get('/dashboard/registro-inicial', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.users.findUnique({
      where: { id: BigInt(userId) },
      select: { no_control: true, carrera: true, telefono: true }
    });

    const carreras = await prisma.carreras.findMany({
      where: { deleted_at: null },
      orderBy: { nombre: 'asc' }
    });

    res.json({
      success: true,
      data: {
        user: {
          no_control: user?.no_control || '',
          carrera: user?.carrera || '',
          telefono: user?.telefono || ''
        },
        carreras: carreras.map(c => ({ id: Number(c.id), nombre: c.nombre }))
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/dashboard/registro-inicial:
 *   post:
 *     summary: Guardar datos del registro inicial
 *     tags: [Participante]
 */
router.post('/dashboard/registro-inicial', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { no_control, carrera, telefono } = req.body;

    if (!no_control || !carrera || !telefono) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    // Basic formats
    if (!/^\d{8}$/.test(no_control)) {
      return res.status(400).json({ success: false, message: 'El número de control debe tener 8 dígitos' });
    }
    if (!/^\d{10}$/.test(telefono)) {
      return res.status(400).json({ success: false, message: 'El teléfono debe tener 10 dígitos' });
    }

    await prisma.users.update({
      where: { id: BigInt(userId) },
      data: {
        no_control,
        carrera,
        telefono,
        updated_at: new Date()
      }
    });

    res.json({ success: true, message: 'Información académica registrada correctamente' });
  } catch (error) {
    next(error);
  }
});


/**
 * @swagger
 * /api/participante/eventos-disponibles:
 *   get:
 *     summary: Listar eventos disponibles para registro
 *     tags: [Participante]
 */
router.get('/eventos-disponibles', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const eventos = await prisma.eventos.findMany({
      where: { fecha_fin: { gte: new Date() } },
      orderBy: { fecha_inicio: 'asc' }
    });
    res.json({ success: true, data: eventos });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/equipos:
 *   post:
 *     summary: Registrar un nuevo equipo y proyecto
 *     tags: [Participante]
 */
router.post('/equipos', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { nombre, evento_id, proyecto_nombre, proyecto_descripcion, repositorio_url } = req.body;

    if (!nombre || !evento_id || !proyecto_nombre || !proyecto_descripcion) {
      return res.status(400).json({ success: false, message: 'Todos los campos obligatorios deben ser completados' });
    }

    // 1. Verificación: ¿Ya está en un equipo para este evento?
    const existingProject = await prisma.proyectos.findFirst({
      where: {
        evento_id: BigInt(evento_id),
        equipos: {
          equipo_miembros: {
            some: { user_id: BigInt(userId) }
          }
        }
      }
    });

    if (existingProject) {
      return res.status(400).json({ success: false, message: 'Ya perteneces a un equipo registrado en este mismo evento.' });
    }

    // 2. Crear el equipo
    const team = await prisma.equipos.create({
      data: {
        nombre,
        updated_at: new Date()
      }
    });

    // 3. Asignar al creador como LIDER
    await prisma.equipo_miembros.create({
      data: {
        equipo_id: team.id,
        user_id: BigInt(userId),
        rol: 'LIDER'
      }
    });

    // 4. Crear el proyecto asociado
    await prisma.proyectos.create({
      data: {
        equipo_id: team.id,
        evento_id: BigInt(evento_id),
        nombre: proyecto_nombre,
        descripcion: proyecto_descripcion,
        repositorio_url: repositorio_url || null,
        updated_at: new Date()
      }
    });

    res.json({ success: true, message: 'Equipo y proyecto registrados exitosamente' });
  } catch (error) {
    next(error);
  }
});


/**
 * @swagger
 * /api/participante/equipos/salir:
 *   delete:
 *     summary: Abandonar el equipo actual
 *     tags: [Participante]
 */
router.delete('/equipos/salir', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    
    const membership = await prisma.equipo_miembros.findFirst({
      where: { user_id: BigInt(userId) },
      include: { equipos: { include: { equipo_miembros: true } } }
    });

    if (!membership) {
      return res.status(404).json({ success: false, message: 'No perteneces a ningún equipo.' });
    }

    const equipoId = membership.equipo_id;
    const esLider = membership.rol === 'LIDER';
    const otrosLideres = membership.equipos.equipo_miembros.filter(m => m.rol === 'LIDER' && m.user_id !== BigInt(userId));

    if (esLider && otrosLideres.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Como líder, no puedes abandonar el equipo si eres el único líder. Debes asignar a otro líder primero.' 
      });
    }

    // Salir del equipo
    await prisma.equipo_miembros.delete({
      where: { id: membership.id }
    });

    // Limpiar invitaciones pendientes
    await prisma.equipo_interacciones.updateMany({
      where: { user_id: BigInt(userId), estado: 'PENDIENTE' },
      data: { estado: 'RECHAZADA', respondido_en: new Date() }
    });

    res.json({ success: true, message: 'Has abandonado el equipo correctamente.' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/equipos/{id}:
 *   get:
 *     summary: Obtener detalles del equipo para gestión
 *     tags: [Participante]
 */
router.get('/equipos/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const equipo = await prisma.equipos.findUnique({
      where: { id: BigInt(id) },
      include: {
        proyectos: { include: { eventos: true } },
        equipo_miembros: { include: { users: true } }
      }
    });

    if (!equipo) return res.status(404).json({ success: false, message: 'Equipo no encontrado' });

    // Verificar pertenencia
    const esMiembro = equipo.equipo_miembros.some(m => m.user_id === BigInt(userId));
    if (!esMiembro) return res.status(403).json({ success: false, message: 'No tienes permiso para ver este equipo' });

    res.json({
      success: true,
      data: {
        equipo: {
          id: Number(equipo.id),
          nombre: equipo.nombre
        },
        proyecto: equipo.proyectos[0] ? {
          ...equipo.proyectos[0],
          id: Number(equipo.proyectos[0].id),
          equipo_id: Number(equipo.proyectos[0].equipo_id),
          evento_id: Number(equipo.proyectos[0].evento_id),
          evento: equipo.proyectos[0].eventos ? {
            ...equipo.proyectos[0].eventos,
            id: Number(equipo.proyectos[0].eventos.id)
          } : null
        } : null,
        miembros: equipo.equipo_miembros.map(m => ({
          id: Number(m.users.id),
          nombre: m.users.name,
          email: m.users.email,
          carrera: m.users.carrera,
          rol: m.rol,
          es_lider: m.rol === 'LIDER'
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/equipos/{id}:
 *   put:
 *     summary: Actualizar datos del equipo/proyecto
 *     tags: [Participante]
 */
router.put('/equipos/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { nombre, proyecto_nombre, proyecto_descripcion, repositorio_url } = req.body;

    const membership = await prisma.equipo_miembros.findFirst({
      where: { equipo_id: BigInt(id), user_id: BigInt(userId) }
    });

    if (!membership || membership.rol !== 'LIDER') {
      return res.status(403).json({ success: false, message: 'Solo el líder puede actualizar el equipo' });
    }

    await prisma.$transaction([
      prisma.equipos.update({
        where: { id: BigInt(id) },
        data: { nombre, updated_at: new Date() }
      }),
      prisma.proyectos.updateMany({
        where: { equipo_id: BigInt(id) },
        data: {
          nombre: proyecto_nombre,
          descripcion: proyecto_descripcion,
          repositorio_url: repositorio_url || null,
          updated_at: new Date()
        }
      })
    ]);

    res.json({ success: true, message: 'Información actualizada correctamente' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/candidatos:
 *   get:
 *     summary: Buscar participantes sin equipo
 *     tags: [Participante]
 */
router.get('/candidatos', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = (req.query.q as string || '').toLowerCase();
    
    const candidatos = await prisma.users.findMany({
      where: {
        role: 'PARTICIPANTE',
        name: { contains: query },
        equipo_miembros: { none: {} }
      },
      select: { id: true, name: true, carrera: true, no_control: true },
      take: 20
    });

    res.json({
      success: true,
      data: candidatos.map(c => ({
        id: Number(c.id),
        name: c.name,
        carrera: c.carrera || 'N/A',
        no_control: c.no_control
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/equipos/invitar:
 *   post:
 *     summary: Enviar invitación a un participante
 *     tags: [Participante]
 */
router.post('/equipos/invitar', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { participante_id, equipo_id, mensaje, perfil_id } = req.body;

    const membership = await prisma.equipo_miembros.findFirst({
      where: { equipo_id: BigInt(equipo_id), user_id: BigInt(userId) }
    });

    if (!membership || membership.rol !== 'LIDER') {
      return res.status(403).json({ success: false, message: 'Solo el líder puede enviar invitaciones' });
    }

    // Verificar si ya tiene equipo
    const targetHasTeam = await prisma.equipo_miembros.findFirst({
        where: { user_id: BigInt(participante_id) }
    });
    if (targetHasTeam) return res.status(400).json({ success: false, message: 'El participante seleccionado ya tiene equipo' });
    
    // Verificar si ya tiene una invitación pendiente de este equipo
    const existingInvite = await prisma.equipo_interacciones.findFirst({
        where: {
            equipo_id: BigInt(equipo_id),
            user_id: BigInt(participante_id),
            tipo: 'INVITACION',
            estado: 'PENDIENTE'
        }
    });

    if (existingInvite) {
        return res.status(400).json({ success: false, message: 'Ya has enviado una invitación a este participante y aún está pendiente.' });
    }

    // Crear interacción
    await prisma.equipo_interacciones.create({
      data: {
        equipo_id: BigInt(equipo_id),
        user_id: BigInt(participante_id),
        tipo: 'INVITACION',
        estado: 'PENDIENTE',
        mensaje: mensaje || null,
        perfil_id: perfil_id ? BigInt(perfil_id) : null
      }
    });

    res.json({ success: true, message: 'Invitación enviada correctamente' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/equipos/miembros/{id}:
 *   delete:
 *     summary: Eliminar un miembro del equipo
 *     tags: [Participante]
 */
router.delete('/equipos/miembros/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const memberId = req.params.id; // El ID del usuario a eliminar

    // 1. Obtener mi equipo y verificar si soy líder
    const myMembership = await prisma.equipo_miembros.findFirst({
      where: { user_id: BigInt(userId) }
    });

    if (!myMembership || myMembership.rol !== 'LIDER') {
      return res.status(403).json({ success: false, message: 'Solo el líder puede eliminar miembros' });
    }

    if (String(BigInt(userId)) === String(BigInt(memberId))) {
      return res.status(400).json({ success: false, message: 'No puedes eliminarte a ti mismo desde aquí. Usa "Abandonar equipo".' });
    }

    // 2. Eliminar el miembro del equipo
    await prisma.equipo_miembros.deleteMany({
      where: { 
        equipo_id: myMembership.equipo_id,
        user_id: BigInt(memberId)
      }
    });

    res.json({ success: true, message: 'Miembro eliminado del equipo' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/perfiles:
 *   get:
 *     summary: Listar perfiles (roles) disponibles
 *     tags: [Participante]
 */
router.get('/perfiles', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const perfiles = await prisma.perfiles.findMany({
      where: { deleted_at: null },
      orderBy: { nombre: 'asc' }
    });
    res.json({ success: true, data: perfiles.map(p => ({ id: Number(p.id), nombre: p.nombre })) });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/equipos/{id}/invitaciones:
 *   get:
 *     summary: Obtener historial de invitaciones enviadas por el equipo
 *     tags: [Participante]
 */
router.get('/equipos/:id/invitaciones', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const invs = await prisma.equipo_interacciones.findMany({
      where: { equipo_id: BigInt(id), tipo: 'INVITACION' },
      include: { users: true },
      orderBy: { created_at: 'desc' }
    });

    res.json({
      success: true,
      data: invs.map(i => ({
        id: Number(i.id),
        usuario: { name: i.users.name, email: i.users.email },
        estado: i.estado,
        mensaje: i.mensaje,
        created_at: i.created_at
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/participante/invitaciones/{id}/responder:
 *   post:
 *     summary: Responder a una invitación (Aceptar/Rechazar)
 *     tags: [Participante]
 */
router.post('/invitaciones/:id/responder', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const userId = req.user!.id;

    const interaction = await prisma.equipo_interacciones.findUnique({
      where: { id: BigInt(id) },
      include: { perfiles: true }
    });

    if (!interaction || interaction.user_id !== BigInt(userId) || interaction.estado !== 'PENDIENTE') {
      return res.status(400).json({ success: false, message: 'Invitación no válida o ya respondida' });
    }

    const nuevoEstado = String(estado).toUpperCase();

    if (nuevoEstado === 'ACEPTADA') {
      // Verificar si ya tiene equipo
      const yaTieneEquipo = await prisma.equipo_miembros.findFirst({
        where: { user_id: BigInt(userId) }
      });
      if (yaTieneEquipo) return res.status(400).json({ success: false, message: 'Ya eres parte de un equipo' });

      await prisma.$transaction([
        prisma.equipo_interacciones.update({
          where: { id: BigInt(id) },
          data: { estado: 'ACEPTADA', respondido_en: new Date() }
        }),
        prisma.equipo_miembros.create({
          data: {
            equipo_id: interaction.equipo_id,
            user_id: BigInt(userId),
            rol: interaction.perfiles?.nombre || 'PROGRAMADOR'
          }
        })
      ]);
      return res.json({ success: true, message: 'Invitación aceptada correctamente' });
    } else {
      await prisma.equipo_interacciones.update({
        where: { id: BigInt(id) },
        data: { estado: 'RECHAZADA', respondido_en: new Date() }
      });
      return res.json({ success: true, message: 'Invitación rechazada' });
    }
  } catch (error) {
    next(error);
  }
});

export { router as participanteDashboardRouter };
