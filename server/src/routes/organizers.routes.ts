import { Router } from 'express';
import { organizerController } from '../controllers/organizer.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { optionalAuthenticate } from '../middleware/optionalAuth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware.js';
import { idParamSchema, organizerUpdateSchema, paginationSchema } from '../schemas/domain.schema.js';

export const organizersRouter = Router();

organizersRouter.get('/', validateQuery(paginationSchema), organizerController.list);
organizersRouter.get('/me', authenticate, authorize('ORGANIZER'), organizerController.getMine);
organizersRouter.put(
  '/me',
  authenticate,
  authorize('ORGANIZER'),
  validateBody(organizerUpdateSchema),
  organizerController.updateMine,
);
organizersRouter.get(
  '/:id',
  optionalAuthenticate,
  validateParams(idParamSchema),
  organizerController.getById,
);
