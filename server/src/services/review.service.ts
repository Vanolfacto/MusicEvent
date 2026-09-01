import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { User } from '@prisma/client';
import { requireEventOwnership, requireOrganizerProfile } from '../utils/access.js';

async function recomputeAverageRating(artistId: number) {
  const agg = await prisma.review.aggregate({
    where: { artistId },
    _avg: { rating: true },
  });
  await prisma.artistProfile.update({
    where: { id: artistId },
    data: { averageRating: agg._avg.rating ?? 0 },
  });
}

export const reviewService = {
  async create(
    user: User,
    data: { eventId: number; artistId: number; rating: number; comment?: string },
  ) {
    const organizer = await requireOrganizerProfile(user);
    await requireEventOwnership(organizer.id, data.eventId);

    const completedPerformance = await prisma.performance.findFirst({
      where: { eventId: data.eventId, artistId: data.artistId, status: 'COMPLETED' },
    });
    if (!completedPerformance) {
      throw new AppError(
        400,
        'Izvođač mora imati završen nastup na ovom događaju pre ocenjivanja',
      );
    }

    const existing = await prisma.review.findUnique({
      where: { eventId_artistId: { eventId: data.eventId, artistId: data.artistId } },
    });
    if (existing) {
      throw new AppError(409, 'Već ste ocenili ovog izvođača za ovaj događaj');
    }

    const review = await prisma.review.create({
      data: {
        eventId: data.eventId,
        artistId: data.artistId,
        organizerId: organizer.id,
        rating: data.rating,
        comment: data.comment,
      },
    });

    await recomputeAverageRating(data.artistId);

    return review;
  },

  async listForEvent(user: User, eventId: number) {
    const organizer = await requireOrganizerProfile(user);
    await requireEventOwnership(organizer.id, eventId);
    return prisma.review.findMany({ where: { eventId } });
  },
};
