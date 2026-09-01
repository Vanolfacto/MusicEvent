import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../middleware/validate.middleware.js';
import { idParamSchema, userStatusUpdateSchema } from '../schemas/domain.schema.js';
import { userController } from '../controllers/user.controller.js';

export const usersRouter = Router();

usersRouter.get('/me', authenticate, userController.me);
usersRouter.get('/', authenticate, authorize('ADMIN'), userController.list);
usersRouter.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN'),
  validateParams(idParamSchema),
  validateBody(userStatusUpdateSchema),
  userController.updateStatus,
);
