import { Router } from 'express';
import { performanceController } from '../controllers/performance.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../middleware/validate.middleware.js';
import {
  eventIdParamSchema,
  idParamSchema,
  performanceCreateSchema,
  performanceUpdateSchema,
} from '../schemas/domain.schema.js';

export const performancesRouter = Router();

performancesRouter.get(
  '/event/:eventId',
  authenticate,
  authorize('ORGANIZER'),
  validateParams(eventIdParamSchema),
  performanceController.listForEvent,
);
performancesRouter.get(
  '/mine',
  authenticate,
  authorize('ARTIST'),
  performanceController.listMine,
);
performancesRouter.post(
  '/',
  authenticate,
  authorize('ORGANIZER'),
  validateBody(performanceCreateSchema),
  performanceController.create,
);
performancesRouter.put(
  '/:id',
  authenticate,
  authorize('ORGANIZER'),
  validateParams(idParamSchema),
  validateBody(performanceUpdateSchema),
  performanceController.update,
);
performancesRouter.delete(
  '/:id',
  authenticate,
  authorize('ORGANIZER'),
  validateParams(idParamSchema),
  performanceController.remove,
);
