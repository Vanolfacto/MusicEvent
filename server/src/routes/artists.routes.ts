import { Router } from 'express';
import { artistController } from '../controllers/artist.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { optionalAuthenticate } from '../middleware/optionalAuth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware.js';
import {
  artistFilterSchema,
  artistUpdateSchema,
  idParamSchema,
} from '../schemas/domain.schema.js';

export const artistsRouter = Router();

artistsRouter.get('/genres/list', artistController.listGenres);
artistsRouter.get('/', validateQuery(artistFilterSchema), artistController.list);
artistsRouter.get('/me', authenticate, authorize('ARTIST'), artistController.getMine);
artistsRouter.put(
  '/me',
  authenticate,
  authorize('ARTIST'),
  validateBody(artistUpdateSchema),
  artistController.updateMine,
);
artistsRouter.get(
  '/:id',
  optionalAuthenticate,
  validateParams(idParamSchema),
  artistController.getById,
);
