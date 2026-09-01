import { Router } from 'express';
import { applicationController } from '../controllers/application.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../middleware/validate.middleware.js';
import {
  applicationApplySchema,
  applicationInviteSchema,
  applicationRespondSchema,
  idParamSchema,
} from '../schemas/domain.schema.js';

export const applicationsRouter = Router();

applicationsRouter.get(
  '/organizer',
  authenticate,
  authorize('ORGANIZER'),
  applicationController.listForOrganizer,
);
applicationsRouter.get(
  '/artist',
  authenticate,
  authorize('ARTIST'),
  applicationController.listForArtist,
);
applicationsRouter.get(
  '/invites',
  authenticate,
  authorize('ARTIST'),
  applicationController.listInvites,
);
applicationsRouter.get(
  '/:id',
  authenticate,
  validateParams(idParamSchema),
  applicationController.getById,
);
applicationsRouter.post(
  '/apply',
  authenticate,
  authorize('ARTIST'),
  validateBody(applicationApplySchema),
  applicationController.apply,
);
applicationsRouter.post(
  '/invite',
  authenticate,
  authorize('ORGANIZER'),
  validateBody(applicationInviteSchema),
  applicationController.invite,
);
applicationsRouter.patch(
  '/:id/respond',
  authenticate,
  validateParams(idParamSchema),
  validateBody(applicationRespondSchema),
  applicationController.respond,
);
applicationsRouter.patch(
  '/:id/withdraw',
  authenticate,
  authorize('ARTIST'),
  validateParams(idParamSchema),
  applicationController.withdraw,
);
