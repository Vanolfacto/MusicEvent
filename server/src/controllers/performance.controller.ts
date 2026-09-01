import type { Request, Response, NextFunction } from 'express';
import { performanceService } from '../services/performance.service.js';
import { getAuthenticatedUser } from '../utils/requestUser.js';

export const performanceController = {
  async listForEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await performanceService.listForEvent(
        getAuthenticatedUser(req),
        Number(req.params.eventId),
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await performanceService.listMine(getAuthenticatedUser(req));
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await performanceService.create(getAuthenticatedUser(req), req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await performanceService.update(
        getAuthenticatedUser(req),
        Number(req.params.id),
        req.body,
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await performanceService.remove(getAuthenticatedUser(req), Number(req.params.id));
      res.json({ success: true, message: 'Nastup je uklonjen iz rasporeda' });
    } catch (error) {
      next(error);
    }
  },
};
