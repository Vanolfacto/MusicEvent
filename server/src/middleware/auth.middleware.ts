import type { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';
import { userRepository } from '../repositories/user.repository.js';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'Autentifikacija je obavezna');
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    const user = await userRepository.findById(payload.sub);
    if (!user) {
      throw new AppError(401, 'Korisnik nije pronađen');
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError(403, 'Nalog nije aktivan');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError(401, 'Neispravan ili istekao token'));
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'Autentifikacija je obavezna'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'Nemate dozvolu za ovu akciju'));
      return;
    }

    next();
  };
}
