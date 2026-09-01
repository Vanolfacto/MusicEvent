import { Router } from 'express';
import { modelController } from '../controllers/model.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

export const modelRouter = Router();

modelRouter.get('/health', authenticate, authorize('ADMIN'), modelController.health);
modelRouter.get('/info', authenticate, modelController.info);
modelRouter.get(
  '/training-runs',
  authenticate,
  authorize('ADMIN'),
  modelController.trainingRuns,
);
