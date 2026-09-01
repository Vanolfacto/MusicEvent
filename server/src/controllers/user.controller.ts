import type { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { getAuthenticatedUser } from '../utils/requestUser.js';
import { toSafeUser } from '../utils/userMapper.js';

export const userController = {
  async me(req: Request, res: Response) {
    res.json({ success: true, data: toSafeUser(getAuthenticatedUser(req)) });
  },

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.list();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await userService.updateStatus(Number(req.params.id), req.body.status);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
