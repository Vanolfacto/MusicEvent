import type { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/review.service.js';
import { getAuthenticatedUser } from '../utils/requestUser.js';

export const reviewController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reviewService.create(getAuthenticatedUser(req), req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listForEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reviewService.listForEvent(
        getAuthenticatedUser(req),
        Number(req.params.eventId),
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
