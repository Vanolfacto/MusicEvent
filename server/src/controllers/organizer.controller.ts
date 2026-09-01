import type { Request, Response, NextFunction } from 'express';
import { organizerService } from '../services/organizer.service.js';
import { getAuthenticatedUser } from '../utils/requestUser.js';

export const organizerController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query as unknown as { page: number; limit: number };
      const data = await organizerService.list(page, limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await organizerService.getById(Number(req.params.id), req.user?.role === 'ADMIN');
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getMine(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await organizerService.getMine(getAuthenticatedUser(req));
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateMine(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await organizerService.updateMine(getAuthenticatedUser(req), req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
