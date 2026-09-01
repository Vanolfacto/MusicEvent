import type { Request } from 'express';
import type { User } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

export function getAuthenticatedUser(req: Request): User {
  if (!req.user) {
    throw new AppError(401, 'Autentifikacija je obavezna');
  }
  return req.user;
}
