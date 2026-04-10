import { z } from 'zod';

/**
 * @openapi
 * components:
 *   schemas:
 *     StoreEvaluacionInput:
 *       type: object
 *       required:
 *         - puntuaciones
 *       properties:
 *         puntuaciones:
 *           type: object
 *           additionalProperties:
 *             type: number
 *           description: Objeto donde las keys son los IDs de los criterios y los values las puntuaciones asignadas
 *         comentario:
 *           type: string
 */

export const storeEvaluacionSchema = z.object({
  body: z.object({
    puntuaciones: z.record(z.string(), z.number().min(0).max(100)),
    comentario: z.string().optional()
  })
});

export const createCriterioSchema = z.object({
  body: z.object({
    evento_id: z.number(),
    nombre: z.string().min(1),
    ponderacion: z.number().min(1).max(100)
  })
});

export const updateCriterioSchema = z.object({
  body: z.object({
    nombre: z.string().min(1).optional(),
    ponderacion: z.number().min(1).max(100).optional()
  })
});
