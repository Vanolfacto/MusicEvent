import type { Request, Response, NextFunction } from 'express';
import { eventService } from '../services/event.service.js';
import { getAuthenticatedUser } from '../utils/requestUser.js';

export const eventController = {
  async listPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await eventService.list({
        ...(req.query as object),
        publicOnly: true,
      } as never);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await eventService.list(req.query as never);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query as unknown as { page: number; limit: number };
      const data = await eventService.listMine(getAuthenticatedUser(req), page, limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await eventService.getById(Number(req.params.id), req.user);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await eventService.create(getAuthenticatedUser(req), req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await eventService.update(getAuthenticatedUser(req), Number(req.params.id), req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await eventService.remove(getAuthenticatedUser(req), Number(req.params.id));
      res.json({ success: true, message: 'Događaj je obrisan' });
    } catch (error) {
      next(error);
    }
  },
};
