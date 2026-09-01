import type { Request, Response, NextFunction } from 'express';
import { artistService } from '../services/artist.service.js';
import { getAuthenticatedUser } from '../utils/requestUser.js';

export const artistController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await artistService.list(req.query as never);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listGenres(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await artistService.listGenres();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await artistService.getById(Number(req.params.id), req.user?.role === 'ADMIN');
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getMine(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await artistService.getMine(getAuthenticatedUser(req));
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateMine(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await artistService.updateMine(getAuthenticatedUser(req), req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
