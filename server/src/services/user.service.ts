import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { toSafeUser, toSafeUsers } from '../utils/userMapper.js';
import type { UserStatus } from '@prisma/client';

export const userService = {
  async list() {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        artistProfile: { select: { id: true } },
        organizerProfile: { select: { id: true } },
      },
    });
    return toSafeUsers(users);
  },

  async updateStatus(id: number, status: UserStatus) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(404, 'Korisnik nije pronađen');
    }

    const user = await prisma.user.update({ where: { id }, data: { status } });
    return toSafeUser(user);
  },
};
