import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateParams } from '../middleware/validate.middleware.js';
import { idParamSchema } from '../schemas/domain.schema.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', authenticate, notificationController.list);
notificationsRouter.patch('/read-all', authenticate, notificationController.markAllRead);
notificationsRouter.patch(
  '/:id/read',
  authenticate,
  validateParams(idParamSchema),
  notificationController.markRead,
);
