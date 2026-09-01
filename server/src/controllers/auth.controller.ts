import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { getAuthenticatedUser } from '../utils/requestUser.js';

const isProduction = process.env.NODE_ENV === 'production';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  // U produkciji client i server su na različitim domenima (npr. Vercel/Render),
  // pa kolačić mora biti sameSite:'none' (zahteva secure:true) da bi se slao na cross-site fetch.
  // Lokalno (http, isti port preko Vite proxy-ja ili isti origin) 'lax' je dovoljan i radi bez HTTPS-a.
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

function setRefreshCookie(res: Response, token: string) {
  res.cookie(authService.getRefreshCookieName(), token, REFRESH_COOKIE_OPTIONS);
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(authService.getRefreshCookieName(), {
    ...REFRESH_COOKIE_OPTIONS,
    maxAge: undefined,
  });
}

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      setRefreshCookie(res, result.refreshToken);
      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      setRefreshCookie(res, result.refreshToken);
      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.[authService.getRefreshCookieName()];
      const result = await authService.refresh(refreshToken);
      setRefreshCookie(res, result.refreshToken);
      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.[authService.getRefreshCookieName()];
      await authService.logout(refreshToken);
      clearRefreshCookie(res);
      res.json({ success: true, message: 'Uspešno odjavljivanje' });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.getMe(getAuthenticatedUser(req).id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getAuthenticatedUser(req);
      await authService.changePassword(user.id, req.body.currentPassword, req.body.newPassword);
      res.json({ success: true, message: 'Lozinka je promenjena' });
    } catch (error) {
      next(error);
    }
  },
};
