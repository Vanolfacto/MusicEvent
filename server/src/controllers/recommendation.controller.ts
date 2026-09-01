import type { Request, Response, NextFunction } from 'express';
import { recommendationService } from '../services/recommendation.service.js';
import { getAuthenticatedUser } from '../utils/requestUser.js';

export const recommendationController = {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const onlyAvailable = req.query.onlyAvailable !== 'false';
      const data = await recommendationService.generateForEvent(
        getAuthenticatedUser(req),
        Number(req.params.eventId),
        onlyAvailable,
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await recommendationService.listForEvent(
        getAuthenticatedUser(req),
        Number(req.params.eventId),
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
