import { prisma } from '../lib/prisma.js';

export const refreshTokenRepository = {
  create(data: { token: string; userId: number; expiresAt: Date }) {
    return prisma.refreshToken.create({ data });
  },

  findByToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  deleteByToken(token: string) {
    return prisma.refreshToken.delete({ where: { token } });
  },

  markUsed(token: string) {
    return prisma.refreshToken.update({
      where: { token },
      data: { usedAt: new Date() },
    });
  },

  deleteByUserId(userId: number) {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  },

  deleteExpired() {
    return prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  },
};
