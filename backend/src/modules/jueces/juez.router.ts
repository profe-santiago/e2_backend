import { Router, Request, Response, NextFunction } from 'express';
import { JuezService } from './juez.service';
import { storeEvaluacionSchema, createCriterioSchema, updateCriterioSchema } from './juez.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';

const router = Router();
const juezService = new JuezService();

const validate = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({ body: req.body });
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * @openapi
 * /api/juez/dashboard:
 *   get:
 *     summary: Obtener el dashboard principal del juez
 *     tags: [Juez]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retorna los eventos y proyectos asignados al juez
 */
router.get('/dashboard', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.user.id);
    const result = await juezService.getDashboardData(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/juez/eventos/{eventoId}:
 *   get:
 *     summary: Obtener detalles de un evento asignado al juez
 *     tags: [Juez]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos completos del evento y sus proyectos a evaluar
 */
router.get('/eventos/:eventoId', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const eventoId = parseInt(req.params.eventoId as string, 10);
    const juezId = Number(req.user.id);
    const result = await juezService.getEvento(eventoId, juezId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/juez/evaluacion/{proyectoId}:
 *   get:
 *     summary: Obtener el formulario de evaluación de un proyecto
 *     tags: [Juez]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: proyectoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del proyecto y evaluaciones o puntuaciones previas del juez
 */
router.get('/evaluacion/:proyectoId', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const proyectoId = parseInt(req.params.proyectoId as string, 10);
    const juezId = Number(req.user.id);
    const result = await juezService.getEvaluacionData(proyectoId, juezId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/juez/evaluacion/{proyectoId}:
 *   post:
 *     summary: Guardar puntuaciones y comentarios de evaluación
 *     tags: [Juez]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: proyectoId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StoreEvaluacionInput'
 *     responses:
 *       200:
 *         description: Evaluación guardada
 */
router.post('/evaluacion/:proyectoId', authMiddleware, validate(storeEvaluacionSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const proyectoId = parseInt(req.params.proyectoId as string, 10);
    const juezId = Number(req.user.id);
    const result = await juezService.storeEvaluacion(proyectoId, juezId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Gestión de Criterios (DESACTIVADO: Ahora lo gestiona el Admin)
/*
router.post('/criterios', authMiddleware, validate(createCriterioSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await juezService.createCriterio(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.put('/criterios/:id', authMiddleware, validate(updateCriterioSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await juezService.updateCriterio(id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/criterios/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await juezService.deleteCriterio(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
*/

export const juezRouter = router;
