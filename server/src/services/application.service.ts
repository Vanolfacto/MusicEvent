import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { ApplicationStatus, User } from '@prisma/client';
import {
  requireArtistProfile,
  requireEventOwnership,
  requireOrganizerProfile,
} from '../utils/access.js';
import { notificationService } from './notification.service.js';

const VALID_RESPONSE_STATUSES: Record<'INVITE' | 'APPLY', ApplicationStatus[]> = {
  INVITE: ['ACCEPTED', 'REJECTED'],
  APPLY: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
};

const applicationInclude = {
  event: {
    include: {
      genres: { include: { genre: true } },
      organizer: true,
    },
  },
  artist: {
    include: {
      genres: { include: { genre: true } },
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  },
};

export const applicationService = {
  async listForOrganizer(user: User, eventId?: number) {
    const organizer = await requireOrganizerProfile(user);
    const where = {
      event: {
        organizerId: organizer.id,
        ...(eventId ? { id: eventId } : {}),
      },
    };
    return prisma.application.findMany({
      where,
      include: applicationInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  async listForArtist(user: User) {
    const artist = await requireArtistProfile(user);
    return prisma.application.findMany({
      where: { artistId: artist.id },
      include: applicationInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  async listInvitesForArtist(user: User) {
    const artist = await requireArtistProfile(user);
    return prisma.application.findMany({
      where: { artistId: artist.id, applicationType: 'INVITE' },
      include: applicationInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  async apply(user: User, eventId: number, message?: string) {
    const artist = await requireArtistProfile(user);
    const event = await prisma.event.findFirst({
      where: { id: eventId, status: 'PUBLISHED' },
      include: { organizer: { include: { user: true } } },
    });
    if (!event) throw new AppError(404, 'Događaj nije dostupan za prijavu');
    if (!artist.isAvailable) throw new AppError(400, 'Morate biti označeni kao dostupni');

    const existing = await prisma.application.findUnique({
      where: {
        eventId_artistId_applicationType: {
          eventId,
          artistId: artist.id,
          applicationType: 'APPLY',
        },
      },
    });
    if (existing) throw new AppError(409, 'Već ste se prijavili na ovaj događaj');

    const application = await prisma.application.create({
      data: {
        eventId,
        artistId: artist.id,
        applicationType: 'APPLY',
        status: 'PENDING',
        message,
      },
      include: applicationInclude,
    });

    await notificationService.create(
      event.organizer.user.id,
      'Nova prijava izvođača',
      `${artist.stageName} se prijavio na događaj "${event.title}".`,
    );

    return application;
  },

  async invite(user: User, eventId: number, artistId: number, message?: string) {
    const organizer = await requireOrganizerProfile(user);
    const event = await requireEventOwnership(organizer.id, eventId);
    if (event.status !== 'PUBLISHED' && event.status !== 'DRAFT') {
      throw new AppError(400, 'Na ovaj događaj više nije moguće slati pozive');
    }

    const artist = await prisma.artistProfile.findFirst({
      where: { id: artistId, user: { status: 'ACTIVE' } },
      include: { user: true },
    });
    if (!artist) throw new AppError(404, 'Izvođač nije pronađen');

    const existing = await prisma.application.findUnique({
      where: {
        eventId_artistId_applicationType: {
          eventId,
          artistId,
          applicationType: 'INVITE',
        },
      },
    });
    if (existing) throw new AppError(409, 'Poziv je već poslat ovom izvođaču');

    const application = await prisma.application.create({
      data: {
        eventId,
        artistId,
        applicationType: 'INVITE',
        status: 'PENDING',
        message,
      },
      include: applicationInclude,
    });

    await notificationService.create(
      artist.user.id,
      'Novi poziv za nastup',
      `Dobili ste poziv za događaj "${event.title}".`,
    );

    return application;
  },

  async respond(
    user: User,
    applicationId: number,
    status: ApplicationStatus,
  ) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        event: { include: { organizer: { include: { user: true } } } },
        artist: { include: { user: true } },
      },
    });
    if (!application) throw new AppError(404, 'Prijava nije pronađena');
    if (application.status !== 'PENDING') {
      throw new AppError(400, 'Prijava je već obrađena');
    }

    if (application.applicationType === 'INVITE') {
      const artist = await requireArtistProfile(user);
      if (application.artistId !== artist.id) {
        throw new AppError(403, 'Nemate dozvolu za ovu akciju');
      }
      if (!VALID_RESPONSE_STATUSES.INVITE.includes(status)) {
        throw new AppError(400, 'Izvođač može samo prihvatiti ili odbiti poziv');
      }
    } else if (application.applicationType === 'APPLY') {
      const organizer = await requireOrganizerProfile(user);
      if (application.event.organizerId !== organizer.id) {
        throw new AppError(403, 'Nemate dozvolu za ovu akciju');
      }
      if (!VALID_RESPONSE_STATUSES.APPLY.includes(status)) {
        throw new AppError(400, 'Organizator može prihvatiti, odbiti ili otkazati prijavu');
      }
    }

    if (status === 'ACCEPTED') {
      const conflictingAccepted = await prisma.application.findFirst({
        where: {
          eventId: application.eventId,
          artistId: application.artistId,
          applicationType: application.applicationType === 'APPLY' ? 'INVITE' : 'APPLY',
          status: 'ACCEPTED',
        },
      });
      if (conflictingAccepted) {
        throw new AppError(
          409,
          'Izvođač već ima prihvaćenu prijavu ili poziv za ovaj događaj',
        );
      }
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: applicationInclude,
    });

    const notifyUserId =
      application.applicationType === 'INVITE'
        ? application.event.organizer.user.id
        : application.artist.user.id;

    const statusLabel =
      status === 'ACCEPTED' ? 'prihvaćena' : status === 'REJECTED' ? 'odbijena' : 'ažurirana';

    await notificationService.create(
      notifyUserId,
      'Status prijave ažuriran',
      `Prijava za događaj "${application.event.title}" je ${statusLabel}.`,
    );

    return updated;
  },

  async withdraw(user: User, applicationId: number) {
    const artist = await requireArtistProfile(user);
    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) throw new AppError(404, 'Prijava nije pronađena');
    if (application.artistId !== artist.id) throw new AppError(403, 'Nemate dozvolu');
    if (application.applicationType !== 'APPLY') {
      throw new AppError(400, 'Samo sopstvene prijave mogu biti povučene');
    }
    if (application.status !== 'PENDING') {
      throw new AppError(400, 'Prijava se ne može povući u trenutnom statusu');
    }

    return prisma.application.update({
      where: { id: applicationId },
      data: { status: 'WITHDRAWN' },
      include: applicationInclude,
    });
  },

  async getById(user: User, applicationId: number) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: applicationInclude,
    });
    if (!application) throw new AppError(404, 'Prijava nije pronađena');

    const organizer = await prisma.organizerProfile.findUnique({ where: { userId: user.id } });
    const artist = await prisma.artistProfile.findUnique({ where: { userId: user.id } });

    const canView =
      user.role === 'ADMIN' ||
      application.event.organizerId === organizer?.id ||
      application.artistId === artist?.id;

    if (!canView) throw new AppError(403, 'Nemate dozvolu');
    return application;
  },
};
