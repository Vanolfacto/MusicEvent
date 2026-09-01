import type { Request, Response, NextFunction } from 'express';
import { applicationService } from '../services/application.service.js';
import { getAuthenticatedUser } from '../utils/requestUser.js';

export const applicationController = {
  async listForOrganizer(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = req.query.eventId ? Number(req.query.eventId) : undefined;
      const data = await applicationService.listForOrganizer(getAuthenticatedUser(req), eventId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listForArtist(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await applicationService.listForArtist(getAuthenticatedUser(req));
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listInvites(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await applicationService.listInvitesForArtist(getAuthenticatedUser(req));
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await applicationService.getById(getAuthenticatedUser(req), Number(req.params.id));
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId, message } = req.body;
      const data = await applicationService.apply(getAuthenticatedUser(req), eventId, message);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async invite(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId, artistId, message } = req.body;
      const data = await applicationService.invite(getAuthenticatedUser(req), eventId, artistId, message);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async respond(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await applicationService.respond(
        getAuthenticatedUser(req),
        Number(req.params.id),
        req.body.status,
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async withdraw(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await applicationService.withdraw(getAuthenticatedUser(req), Number(req.params.id));
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
