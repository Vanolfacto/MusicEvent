import jwt, { type SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import type { UserRole } from '@prisma/client';

export interface AccessTokenPayload {
  sub: number;
  email: string;
  role: UserRole;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  return decoded as unknown as AccessTokenPayload;
}

export function generateRefreshTokenValue(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function getRefreshTokenExpiryDate(): Date {
  const match = env.JWT_REFRESH_EXPIRES_IN.match(/^(\d+)([dhms])$/);
  if (!match) {
    throw new Error(
      `Neispravan format JWT_REFRESH_EXPIRES_IN: "${env.JWT_REFRESH_EXPIRES_IN}"`,
    );
  }

  const value = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return new Date(Date.now() + value * multipliers[unit]);
}
