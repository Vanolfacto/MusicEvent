import type { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';
import { getAuthenticatedUser } from '../utils/requestUser.js';

export const notificationController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getAuthenticatedUser(req);
      const [items, unreadCount] = await Promise.all([
        notificationService.listForUser(user.id),
        notificationService.unreadCount(user.id),
      ]);
      res.json({ success: true, data: { items, unreadCount } });
    } catch (error) {
      next(error);
    }
  },

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getAuthenticatedUser(req);
      await notificationService.markRead(user.id, Number(req.params.id));
      res.json({ success: true, message: 'Notifikacija označena kao pročitana' });
    } catch (error) {
      next(error);
    }
  },

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getAuthenticatedUser(req);
      await notificationService.markAllRead(user.id);
      res.json({ success: true, message: 'Sve notifikacije su označene kao pročitane' });
    } catch (error) {
      next(error);
    }
  },
};
