import { Router } from 'express';
import { eventController } from '../controllers/event.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { optionalAuthenticate } from '../middleware/optionalAuth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware.js';
import {
  eventCreateSchema,
  eventFilterSchema,
  eventUpdateSchema,
  idParamSchema,
  paginationSchema,
} from '../schemas/domain.schema.js';

export const eventsRouter = Router();

eventsRouter.get('/public', validateQuery(eventFilterSchema), eventController.listPublic);
eventsRouter.get(
  '/mine',
  authenticate,
  authorize('ORGANIZER'),
  validateQuery(paginationSchema),
  eventController.listMine,
);
eventsRouter.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  validateQuery(eventFilterSchema),
  eventController.listAll,
);
eventsRouter.get(
  '/:id',
  optionalAuthenticate,
  validateParams(idParamSchema),
  eventController.getById,
);
eventsRouter.post(
  '/',
  authenticate,
  authorize('ORGANIZER'),
  validateBody(eventCreateSchema),
  eventController.create,
);
eventsRouter.put(
  '/:id',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  validateParams(idParamSchema),
  validateBody(eventUpdateSchema),
  eventController.update,
);
eventsRouter.delete(
  '/:id',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  validateParams(idParamSchema),
  eventController.remove,
);
