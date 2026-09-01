import { AppError } from '../middleware/errorHandler.js';
import { userRepository } from '../repositories/user.repository.js';
import { refreshTokenRepository } from '../repositories/refreshToken.repository.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import {
  generateRefreshTokenValue,
  getRefreshTokenExpiryDate,
  signAccessToken,
} from '../utils/jwt.js';
import { toSafeUser } from '../utils/userMapper.js';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema.js';
import { prisma } from '../lib/prisma.js';
import type { UserRole } from '@prisma/client';

const REFRESH_COOKIE_NAME = 'refreshToken';

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email.toLowerCase());
    if (existing) {
      throw new AppError(409, 'Email adresa je već registrovana');
    }

    const passwordHash = await hashPassword(input.password);
    const email = input.email.toLowerCase();

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email,
          passwordHash,
          role: input.role,
        },
      });

      if (input.role === 'ORGANIZER') {
        await tx.organizerProfile.create({
          data: {
            userId: createdUser.id,
            organizationName: input.organizationName!,
            city: input.city!,
            description: 'Novi organizator na platformi.',
          },
        });
      }

      if (input.role === 'ARTIST') {
        await tx.artistProfile.create({
          data: {
            userId: createdUser.id,
            stageName: input.stageName!,
            city: input.city!,
            artistType: input.artistType!,
            minimumFee: 100,
            maximumFee: 1000,
            biography: 'Novi izvođač na platformi.',
          },
        });
      }

      return createdUser;
    });

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return {
      user: toSafeUser(user),
      ...tokens,
    };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email.toLowerCase());
    if (!user) {
      throw new AppError(401, 'Neispravan email ili lozinka');
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError(403, 'Nalog nije aktivan');
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'Neispravan email ili lozinka');
    }

    await refreshTokenRepository.deleteExpired();
    const tokens = await this.issueTokens(user.id, user.email, user.role);

    return {
      user: toSafeUser(user),
      ...tokens,
    };
  },

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new AppError(401, 'Refresh token nije pronađen');
    }

    const stored = await refreshTokenRepository.findByToken(refreshToken);
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await refreshTokenRepository.deleteByToken(refreshToken);
      }
      throw new AppError(401, 'Neispravan ili istekao refresh token');
    }

    if (stored.usedAt) {
      // Token je već jednom iskorišćen — ovo je znak da je ukraden (reuse attack).
      // Prekidamo sve sesije korisnika dok se ne uloguje ponovo.
      await refreshTokenRepository.deleteByUserId(stored.userId);
      throw new AppError(
        401,
        'Otkrivena je ponovna upotreba refresh tokena. Sve sesije su prekinute, ulogujte se ponovo.',
      );
    }

    if (stored.user.status !== 'ACTIVE') {
      throw new AppError(403, 'Nalog nije aktivan');
    }

    await refreshTokenRepository.markUsed(refreshToken);
    const tokens = await this.issueTokens(
      stored.user.id,
      stored.user.email,
      stored.user.role,
    );

    return {
      user: toSafeUser(stored.user),
      ...tokens,
    };
  },

  async logout(refreshToken: string | undefined) {
    if (refreshToken) {
      await refreshTokenRepository.deleteByToken(refreshToken).catch(() => undefined);
    }
  },

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, 'Korisnik nije pronađen');
    }

    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'Trenutna lozinka nije ispravna');
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    await refreshTokenRepository.deleteByUserId(userId);
  },

  async getMe(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, 'Korisnik nije pronađen');
    }

    const profile =
      user.role === 'ORGANIZER'
        ? await prisma.organizerProfile.findUnique({ where: { userId } })
        : user.role === 'ARTIST'
          ? await prisma.artistProfile.findUnique({
              where: { userId },
              include: { genres: { include: { genre: true } } },
            })
          : null;

    return {
      user: toSafeUser(user),
      profile,
    };
  },

  async issueTokens(userId: number, email: string, role: UserRole) {
    const accessToken = signAccessToken({ sub: userId, email, role });
    const refreshToken = generateRefreshTokenValue();
    const expiresAt = getRefreshTokenExpiryDate();

    await refreshTokenRepository.create({
      token: refreshToken,
      userId,
      expiresAt,
    });

    return { accessToken, refreshToken };
  },

  getRefreshCookieName() {
    return REFRESH_COOKIE_NAME;
  },
};
