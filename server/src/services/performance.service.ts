import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { PerformanceStatus, User } from '@prisma/client';
import {
  assertEventActive,
  requireArtistProfile,
  requireEventOwnership,
  requireOrganizerProfile,
} from '../utils/access.js';
import { checkPerformanceConflicts } from '../utils/scheduleConflict.js';
import { notificationService } from './notification.service.js';

const performanceInclude = {
  event: {
    include: {
      organizer: true,
    },
  },
  artist: {
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  },
};

export const performanceService = {
  async listForEvent(user: User, eventId: number) {
    const organizer = await requireOrganizerProfile(user);
    await requireEventOwnership(organizer.id, eventId);

    return prisma.performance.findMany({
      where: { eventId },
      include: performanceInclude,
      orderBy: { startDateTime: 'asc' },
    });
  },

  async listMine(user: User) {
    const artist = await requireArtistProfile(user);
    return prisma.performance.findMany({
      where: { artistId: artist.id },
      include: performanceInclude,
      orderBy: { startDateTime: 'asc' },
    });
  },

  async create(
    user: User,
    data: {
      eventId: number;
      artistId: number;
      startDateTime: Date;
      endDateTime: Date;
      agreedFee: number;
      status: PerformanceStatus;
    },
  ) {
    const organizer = await requireOrganizerProfile(user);
    const event = await requireEventOwnership(organizer.id, data.eventId);
    assertEventActive(event, 'zakazivanje nastupa');

    const acceptedApplication = await prisma.application.findFirst({
      where: {
        eventId: data.eventId,
        artistId: data.artistId,
        status: 'ACCEPTED',
      },
    });
    if (!acceptedApplication) {
      throw new AppError(
        400,
        'Izvođač mora imati prihvaćenu prijavu ili poziv pre dodavanja u raspored',
      );
    }

    const artist = await prisma.artistProfile.findUnique({
      where: { id: data.artistId },
      include: { user: true },
    });
    if (!artist) throw new AppError(404, 'Izvođač nije pronađen');

    const conflicts = await this.detectConflicts({
      eventId: data.eventId,
      artistId: data.artistId,
      startDateTime: data.startDateTime,
      endDateTime: data.endDateTime,
      artistAvailable: artist.isAvailable,
      eventStart: event.startDateTime,
      eventEnd: event.endDateTime,
    });

    if (conflicts.length > 0) {
      throw new AppError(409, conflicts.map((c) => c.message).join(' '));
    }

    const performance = await prisma.performance.create({
      data,
      include: performanceInclude,
    });

    await notificationService.create(
      artist.user.id,
      'Nastup zakazan',
      `Vaš nastup na događaju "${event.title}" je dodat u raspored.`,
    );

    return performance;
  },

  async update(
    user: User,
    performanceId: number,
    data: Partial<{
      startDateTime: Date;
      endDateTime: Date;
      agreedFee: number;
      status: PerformanceStatus;
    }>,
  ) {
    const organizer = await requireOrganizerProfile(user);
    const existing = await prisma.performance.findUnique({
      where: { id: performanceId },
      include: { event: true, artist: { include: { user: true } } },
    });
    if (!existing) throw new AppError(404, 'Nastup nije pronađen');
    await requireEventOwnership(organizer.id, existing.eventId);

    if (data.status && data.status !== existing.status && existing.status === 'COMPLETED') {
      throw new AppError(400, 'Status završenog nastupa se više ne može menjati');
    }

    const startDateTime = data.startDateTime ?? existing.startDateTime;
    const endDateTime = data.endDateTime ?? existing.endDateTime;
    const newStatus = data.status ?? existing.status;
    const reactivatingFromCancelled = existing.status === 'CANCELLED' && newStatus !== 'CANCELLED';

    if (data.startDateTime || data.endDateTime || reactivatingFromCancelled) {
      const conflicts = await this.detectConflicts({
        eventId: existing.eventId,
        artistId: existing.artistId,
        startDateTime,
        endDateTime,
        artistAvailable: existing.artist.isAvailable,
        eventStart: existing.event.startDateTime,
        eventEnd: existing.event.endDateTime,
        excludePerformanceId: performanceId,
      });

      if (conflicts.length > 0) {
        throw new AppError(409, conflicts.map((c) => c.message).join(' '));
      }
    }

    const updated = await prisma.performance.update({
      where: { id: performanceId },
      data,
      include: performanceInclude,
    });

    if (data.status && data.status !== existing.status) {
      const statusLabels: Record<PerformanceStatus, string> = {
        SCHEDULED: 'zakazan',
        CONFIRMED: 'potvrđen',
        COMPLETED: 'završen',
        CANCELLED: 'otkazan',
      };
      await notificationService.create(
        existing.artist.user.id,
        'Status nastupa ažuriran',
        `Vaš nastup na događaju "${existing.event.title}" je sada ${statusLabels[data.status]}.`,
      );
    }

    return updated;
  },

  async remove(user: User, performanceId: number) {
    const organizer = await requireOrganizerProfile(user);
    const existing = await prisma.performance.findUnique({ where: { id: performanceId } });
    if (!existing) throw new AppError(404, 'Nastup nije pronađen');
    await requireEventOwnership(organizer.id, existing.eventId);

    if (existing.status === 'COMPLETED') {
      throw new AppError(
        400,
        'Završen nastup se ne može obrisati — predstavlja istorijski zapis i koristi se pri ML preporukama',
      );
    }

    await prisma.performance.delete({ where: { id: performanceId } });
  },

  async detectConflicts(params: {
    eventId: number;
    artistId: number;
    startDateTime: Date;
    endDateTime: Date;
    artistAvailable: boolean;
    eventStart: Date;
    eventEnd: Date;
    excludePerformanceId?: number;
  }) {
    const [artistPerformances, eventPerformances] = await Promise.all([
      prisma.performance.findMany({
        where: {
          artistId: params.artistId,
          status: { not: 'CANCELLED' },
          ...(params.excludePerformanceId ? { id: { not: params.excludePerformanceId } } : {}),
        },
        select: { startDateTime: true, endDateTime: true },
      }),
      prisma.performance.findMany({
        where: {
          eventId: params.eventId,
          status: { not: 'CANCELLED' },
          ...(params.excludePerformanceId ? { id: { not: params.excludePerformanceId } } : {}),
        },
        select: { startDateTime: true, endDateTime: true },
      }),
    ]);

    return checkPerformanceConflicts({
      performance: {
        startDateTime: params.startDateTime,
        endDateTime: params.endDateTime,
      },
      event: {
        startDateTime: params.eventStart,
        endDateTime: params.eventEnd,
      },
      artistAvailable: params.artistAvailable,
      artistPerformances,
      eventPerformances,
    });
  },
};
