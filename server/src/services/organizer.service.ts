import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { User } from '@prisma/client';
import { requireOrganizerProfile } from '../utils/access.js';
import { paginate } from '../utils/pagination.js';

export const organizerService = {
  async list(page: number, limit: number) {
    const where = { user: { status: 'ACTIVE' as const } };
    return paginate(page, limit, {
      findMany: (args) =>
        prisma.organizerProfile.findMany({
          where,
          ...args,
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true, status: true },
            },
            _count: { select: { events: true } },
          },
          orderBy: { organizationName: 'asc' },
        }),
      count: () => prisma.organizerProfile.count({ where }),
    });
  },

  async getById(id: number, isAdmin = false) {
    const profile = await prisma.organizerProfile.findFirst({
      where: { id, ...(isAdmin ? {} : { user: { status: 'ACTIVE' } }) },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, status: true },
        },
        events: {
          where: { status: 'PUBLISHED' },
          take: 10,
          orderBy: { startDateTime: 'asc' },
        },
      },
    });
    if (!profile) throw new AppError(404, 'Organizator nije pronađen');
    return profile;
  },

  async getMine(user: User) {
    return requireOrganizerProfile(user);
  },

  async updateMine(
    user: User,
    data: {
      organizationName?: string;
      description?: string | null;
      city?: string;
      phone?: string | null;
    },
  ) {
    const profile = await requireOrganizerProfile(user);
    return prisma.organizerProfile.update({
      where: { id: profile.id },
      data,
    });
  },
};
