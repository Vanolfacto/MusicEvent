import { Router } from 'express';
import { reviewController } from '../controllers/review.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../middleware/validate.middleware.js';
import { eventIdParamSchema, reviewCreateSchema } from '../schemas/domain.schema.js';

export const reviewsRouter = Router();

reviewsRouter.post(
  '/',
  authenticate,
  authorize('ORGANIZER'),
  validateBody(reviewCreateSchema),
  reviewController.create,
);
reviewsRouter.get(
  '/event/:eventId',
  authenticate,
  authorize('ORGANIZER'),
  validateParams(eventIdParamSchema),
  reviewController.listForEvent,
);
