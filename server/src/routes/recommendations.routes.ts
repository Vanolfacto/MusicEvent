import { Router } from 'express';
import { recommendationController } from '../controllers/recommendation.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateParams } from '../middleware/validate.middleware.js';
import { eventIdParamSchema } from '../schemas/domain.schema.js';

export const recommendationsRouter = Router();

recommendationsRouter.post(
  '/events/:eventId/generate',
  authenticate,
  authorize('ORGANIZER'),
  validateParams(eventIdParamSchema),
  recommendationController.generate,
);

recommendationsRouter.get(
  '/events/:eventId',
  authenticate,
  authorize('ORGANIZER'),
  validateParams(eventIdParamSchema),
  recommendationController.list,
);
