import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const notificationService = {
  async create(userId: number, title: string, message: string) {
    return prisma.notification.create({
      data: { userId, title, message },
    });
  },

  async listForUser(userId: number) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  },

  async unreadCount(userId: number) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  },

  async markRead(userId: number, id: number) {
    const result = await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    if (result.count === 0) {
      throw new AppError(404, 'Notifikacija nije pronađena');
    }
  },

  async markAllRead(userId: number) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },
};
