import type { Request, Response, NextFunction } from 'express';
import { modelService } from '../services/model.service.js';

export const modelController = {
  async info(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await modelService.getMlInfo();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async health(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await modelService.getMlHealth();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async trainingRuns(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await modelService.getTrainingRuns();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
