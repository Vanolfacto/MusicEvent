import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { userRepository } from '../repositories/user.repository.js';

export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    const user = await userRepository.findById(payload.sub);

    if (user && user.status === 'ACTIVE') {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
}
