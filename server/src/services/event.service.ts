import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { Prisma, EventStatus, EventType, User } from '@prisma/client';
import { requireEventOwnershipOrAdmin, requireOrganizerProfile } from '../utils/access.js';
import { paginate } from '../utils/pagination.js';

const eventInclude = {
  genres: { include: { genre: true } },
  organizer: {
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  },
  _count: {
    select: {
      applications: true,
      performances: true,
      recommendations: true,
    },
  },
};

async function validateGenreIds(
  client: Pick<Prisma.TransactionClient, 'genre'> | typeof prisma,
  genreIds: number[],
) {
  const genres = await client.genre.findMany({ where: { id: { in: genreIds } } });
  if (genres.length !== genreIds.length) {
    throw new AppError(400, 'Jedan ili više žanrova nije validan');
  }
}

const TERMINAL_EVENT_STATUSES: EventStatus[] = ['CANCELLED', 'COMPLETED'];

export const eventService = {
  async list(filters: {
    page: number;
    limit: number;
    city?: string;
    eventType?: EventType;
    status?: EventStatus;
    genreId?: number;
    search?: string;
    publicOnly?: boolean;
  }) {
    const where = {
      ...(filters.publicOnly
        ? { status: 'PUBLISHED' as const, endDateTime: { gt: new Date() } }
        : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.city ? { city: { contains: filters.city, mode: 'insensitive' as const } } : {}),
      ...(filters.eventType ? { eventType: filters.eventType } : {}),
      ...(filters.genreId ? { genres: { some: { genreId: filters.genreId } } } : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: 'insensitive' as const } },
              { venue: { contains: filters.search, mode: 'insensitive' as const } },
              { city: { contains: filters.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    return paginate(filters.page, filters.limit, {
      findMany: (args) =>
        prisma.event.findMany({
          where,
          ...args,
          include: eventInclude,
          orderBy: { startDateTime: 'asc' },
        }),
      count: () => prisma.event.count({ where }),
    });
  },

  async getById(id: number, user?: User) {
    let publicOnly = true;

    if (user?.role === 'ADMIN') {
      publicOnly = false;
    } else if (user?.role === 'ORGANIZER') {
      const [organizer, eventMeta] = await Promise.all([
        prisma.organizerProfile.findUnique({ where: { userId: user.id } }),
        prisma.event.findUnique({ where: { id }, select: { organizerId: true } }),
      ]);
      if (organizer && eventMeta?.organizerId === organizer.id) {
        publicOnly = false;
      }
    }

    const event = await prisma.event.findFirst({
      where: {
        id,
        ...(publicOnly ? { status: 'PUBLISHED' } : {}),
      },
      include: {
        ...eventInclude,
        applications: {
          include: {
            artist: {
              include: { genres: { include: { genre: true } } },
            },
          },
        },
        performances: {
          include: {
            artist: true,
          },
          orderBy: { startDateTime: 'asc' },
        },
      },
    });
    if (!event) throw new AppError(404, 'Događaj nije pronađen');
    return event;
  },

  async listMine(user: User, page: number, limit: number) {
    const organizer = await requireOrganizerProfile(user);
    const where = { organizerId: organizer.id };
    return paginate(page, limit, {
      findMany: (args) =>
        prisma.event.findMany({
          where,
          ...args,
          include: eventInclude,
          orderBy: { startDateTime: 'desc' },
        }),
      count: () => prisma.event.count({ where }),
    });
  },

  async create(
    user: User,
    data: {
      title: string;
      description?: string | null;
      eventType: EventType;
      city: string;
      venue: string;
      address?: string | null;
      startDateTime: Date;
      endDateTime: Date;
      expectedAudience: number;
      minimumBudget: number;
      maximumBudget: number;
      preferredArtistType: import('@prisma/client').ArtistType;
      status: EventStatus;
      genreIds: number[];
    },
  ) {
    const organizer = await requireOrganizerProfile(user);
    await validateGenreIds(prisma, data.genreIds);

    const { genreIds, ...eventData } = data;
    return prisma.event.create({
      data: {
        ...eventData,
        organizerId: organizer.id,
        genres: {
          create: genreIds.map((genreId) => ({ genreId })),
        },
      },
      include: eventInclude,
    });
  },

  async update(user: User, eventId: number, data: Partial<{
    title: string;
    description: string | null;
    eventType: EventType;
    city: string;
    venue: string;
    address: string | null;
    startDateTime: Date;
    endDateTime: Date;
    expectedAudience: number;
    minimumBudget: number;
    maximumBudget: number;
    preferredArtistType: import('@prisma/client').ArtistType;
    status: EventStatus;
    genreIds: number[];
  }>) {
    const event = await requireEventOwnershipOrAdmin(user, eventId);
    const { genreIds, ...eventData } = data;

    if (eventData.status && eventData.status !== event.status && TERMINAL_EVENT_STATUSES.includes(event.status)) {
      throw new AppError(400, 'Status događaja koji je otkazan ili završen se više ne može menjati');
    }

    const startDateTime = eventData.startDateTime ?? event.startDateTime;
    const endDateTime = eventData.endDateTime ?? event.endDateTime;
    const minimumBudget = eventData.minimumBudget ?? Number(event.minimumBudget);
    const maximumBudget = eventData.maximumBudget ?? Number(event.maximumBudget);

    if (endDateTime <= startDateTime) {
      throw new AppError(400, 'Kraj događaja mora biti posle početka');
    }
    if (minimumBudget > maximumBudget) {
      throw new AppError(400, 'Minimalni budžet ne može biti veći od maksimalnog');
    }

    return prisma.$transaction(async (tx) => {
      if (genreIds) {
        await validateGenreIds(tx, genreIds);
        await tx.eventGenre.deleteMany({ where: { eventId } });
        await tx.eventGenre.createMany({
          data: genreIds.map((genreId) => ({ eventId, genreId })),
        });
      }

      return tx.event.update({
        where: { id: eventId },
        data: eventData,
        include: eventInclude,
      });
    });
  },

  async remove(user: User, eventId: number) {
    await requireEventOwnershipOrAdmin(user, eventId);
    await prisma.event.delete({ where: { id: eventId } });
  },
};
