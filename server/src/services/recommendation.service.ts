import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { User } from '@prisma/client';
import { assertEventActive, requireEventOwnership, requireOrganizerProfile } from '../utils/access.js';
import { mlClientService } from './mlClient.service.js';
import {
  buildMlArtistPayload,
  buildMlEventPayload,
} from '../utils/mlPayload.js';

const recommendationArtistInclude = {
  artist: {
    include: {
      genres: { include: { genre: true } },
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  },
};

export const recommendationRepository = {
  deleteAllForEvent(eventId: number) {
    return prisma.recommendation.deleteMany({
      where: { eventId },
    });
  },

  deleteForEvent(eventId: number, modelVersion: string) {
    return prisma.recommendation.deleteMany({
      where: { eventId, modelVersion },
    });
  },

  createMany(
    eventId: number,
    modelVersion: string,
    items: { artistId: number; score: number; explanation: string }[],
  ) {
    return prisma.recommendation.createManyAndReturn({
      data: items.map((item) => ({
        eventId,
        artistId: item.artistId,
        score: item.score,
        modelVersion,
        explanation: item.explanation,
      })),
      skipDuplicates: true,
      include: recommendationArtistInclude,
    });
  },

  findByEvent(eventId: number) {
    return prisma.recommendation.findMany({
      where: { eventId },
      include: recommendationArtistInclude,
      orderBy: { score: 'desc' },
    });
  },
};

async function computePastSuccessByArtist(
  artistIds: number[],
  eventType: string,
): Promise<Map<number, number>> {
  const result = new Map<number, number>();
  if (artistIds.length === 0) return result;

  const performances = await prisma.performance.findMany({
    where: {
      artistId: { in: artistIds },
      status: 'COMPLETED',
      event: { eventType: eventType as never },
    },
    select: {
      artistId: true,
      event: {
        select: {
          reviews: { select: { rating: true, artistId: true } },
        },
      },
    },
  });

  const byArtist = new Map<number, { hasPerformance: boolean; ratings: number[] }>();
  for (const perf of performances) {
    const bucket = byArtist.get(perf.artistId) ?? { hasPerformance: false, ratings: [] };
    bucket.hasPerformance = true;
    for (const review of perf.event.reviews) {
      if (review.artistId === perf.artistId) {
        bucket.ratings.push(review.rating);
      }
    }
    byArtist.set(perf.artistId, bucket);
  }

  for (const artistId of artistIds) {
    const bucket = byArtist.get(artistId);
    if (!bucket) {
      result.set(artistId, 0.5);
    } else if (bucket.ratings.length === 0) {
      result.set(artistId, 0.55);
    } else {
      const positive = bucket.ratings.filter((r) => r >= 4).length;
      result.set(artistId, Math.min(1, positive / bucket.ratings.length));
    }
  }

  return result;
}

type RecommendationRow = {
  id: number;
  artistId: number;
  score: { toString(): string } | number;
  modelVersion: string;
  explanation: string;
  createdAt: Date;
  artist: Awaited<ReturnType<typeof recommendationRepository.findByEvent>>[number]['artist'];
};

function computeGenreMatch(eventGenreIds: Set<number>, artistGenreIds: number[]): number {
  if (eventGenreIds.size === 0) return 0;
  const overlap = artistGenreIds.filter((id) => eventGenreIds.has(id)).length;
  return overlap / eventGenreIds.size;
}

function dedupeSaveItems(
  items: { artistId: number; score: number; explanation: string }[],
) {
  const byArtist = new Map<number, { artistId: number; score: number; explanation: string }>();
  for (const item of items) {
    const prev = byArtist.get(item.artistId);
    if (!prev || item.score > prev.score) {
      byArtist.set(item.artistId, item);
    }
  }
  return [...byArtist.values()].sort((a, b) => b.score - a.score);
}

function dedupeByArtist(rows: RecommendationRow[]) {
  const byArtist = new Map<number, RecommendationRow>();
  for (const row of rows) {
    const score = Number(row.score);
    const prev = byArtist.get(row.artistId);
    if (!prev) {
      byArtist.set(row.artistId, row);
      continue;
    }
    const prevScore = Number(prev.score);
    if (score > prevScore || (score === prevScore && row.createdAt > prev.createdAt)) {
      byArtist.set(row.artistId, row);
    }
  }
  return [...byArtist.values()].sort((a, b) => Number(b.score) - Number(a.score));
}

function mapRecommendationRows(rows: RecommendationRow[], eventGenreIds: Set<number>) {
  return dedupeByArtist(rows).map((rec) => ({
    id: rec.id,
    artistId: rec.artistId,
    score: Number(rec.score),
    modelVersion: rec.modelVersion,
    explanation: rec.explanation.split('; '),
    artist: rec.artist,
    createdAt: rec.createdAt,
    genreMatch: computeGenreMatch(
      eventGenreIds,
      rec.artist.genres.map((g) => g.genreId),
    ),
  }));
}

export const recommendationService = {
  async generateForEvent(user: User, eventId: number, onlyAvailable = true) {
    const organizer = await requireOrganizerProfile(user);
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { genres: true },
    });

    if (!event) {
      throw new AppError(404, 'Događaj nije pronađen');
    }

    await requireEventOwnership(organizer.id, eventId);
    assertEventActive(event, 'generisanje preporuka');

    const artists = await prisma.artistProfile.findMany({
      where: {
        user: { status: 'ACTIVE' },
        artistType: event.preferredArtistType,
        ...(onlyAvailable ? { isAvailable: true } : {}),
      },
      include: { genres: true },
      take: 200,
    });

    if (artists.length === 0) {
      throw new AppError(
        404,
        `Nema dostupnih izvođača tipa ${event.preferredArtistType} za ovaj događaj`,
      );
    }

    const eventPayload = buildMlEventPayload({
      ...event,
      genres: event.genres.map((g) => ({ genreId: g.genreId })),
    });

    const eventGenreIds = new Set(event.genres.map((g) => g.genreId));
    const genreMatchByArtist = new Map<number, number>(
      artists.map((artist) => [
        artist.id,
        computeGenreMatch(eventGenreIds, artist.genres.map((g) => g.genreId)),
      ]),
    );

    const pastSuccessByArtist = await computePastSuccessByArtist(
      artists.map((artist) => artist.id),
      event.eventType,
    );

    const artistPayloads = artists.map((artist) =>
      buildMlArtistPayload(
        {
          ...artist,
          genres: artist.genres.map((g) => ({ genreId: g.genreId })),
        },
        pastSuccessByArtist.get(artist.id) ?? 0.5,
      ),
    );

    let mlResponse;
    try {
      mlResponse = await mlClientService.recommend(eventPayload, artistPayloads);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(503, 'ML servis trenutno nije dostupan');
    }

    const modelVersion = mlResponse.modelVersion;

    await recommendationRepository.deleteAllForEvent(eventId);

    const saveItems = dedupeSaveItems(
      mlResponse.recommendations
        .filter(
          (item): item is typeof item & { artistId: number } =>
            item.artistId !== undefined && item.artistId !== null,
        )
        .map((item) => {
          const genreMatch = genreMatchByArtist.get(item.artistId) ?? 0;
          // ML model daje žanru samo ~9% značaja (videti feature_importance u model_metadata.json),
          // pa preporuke bez podudaranja žanra i dalje mogu da isplivaju visoko na osnovu budžeta/ocene.
          // Ovde ih namerno kažnjavamo (do 50% pri genreMatch=0) da žanr stvarno utiče na rangiranje.
          const adjustedScore = Math.round(item.score * (0.5 + 0.5 * genreMatch) * 10000) / 10000;
          return {
            artistId: item.artistId,
            score: adjustedScore,
            explanation: item.explanation.join('; '),
          };
        }),
    );

    const saved =
      saveItems.length > 0
        ? await recommendationRepository.createMany(eventId, modelVersion, saveItems)
        : [];

    return {
      modelVersion,
      eventId,
      recommendations: mapRecommendationRows(saved, eventGenreIds),
    };
  },

  async listForEvent(user: User, eventId: number) {
    const organizer = await requireOrganizerProfile(user);
    await requireEventOwnership(organizer.id, eventId);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { genres: { select: { genreId: true } } },
    });
    const eventGenreIds = new Set((event?.genres ?? []).map((g) => g.genreId));

    const recommendations = await recommendationRepository.findByEvent(eventId);
    return mapRecommendationRows(recommendations, eventGenreIds);
  },
};
