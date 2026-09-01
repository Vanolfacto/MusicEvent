import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type { ArtistType, User } from '@prisma/client';
import { requireArtistProfile } from '../utils/access.js';
import { paginate } from '../utils/pagination.js';

export const artistService = {
  async list(filters: {
    page: number;
    limit: number;
    city?: string;
    genreId?: number;
    artistType?: ArtistType;
    minRating?: number;
    maxFee?: number;
    isAvailable?: boolean;
    search?: string;
  }) {
    const where = {
      ...(filters.city ? { city: { contains: filters.city, mode: 'insensitive' as const } } : {}),
      ...(filters.artistType ? { artistType: filters.artistType } : {}),
      ...(filters.minRating !== undefined ? { averageRating: { gte: filters.minRating } } : {}),
      ...(filters.maxFee !== undefined ? { minimumFee: { lte: filters.maxFee } } : {}),
      ...(filters.isAvailable !== undefined ? { isAvailable: filters.isAvailable } : {}),
      ...(filters.genreId
        ? { genres: { some: { genreId: filters.genreId } } }
        : {}),
      ...(filters.search
        ? {
            OR: [
              { stageName: { contains: filters.search, mode: 'insensitive' as const } },
              { city: { contains: filters.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      user: { status: 'ACTIVE' as const },
    };

    return paginate(filters.page, filters.limit, {
      findMany: (args) =>
        prisma.artistProfile.findMany({
          where,
          ...args,
          include: {
            genres: { include: { genre: true } },
            user: {
              select: { id: true, firstName: true, lastName: true, status: true },
            },
          },
          orderBy: [{ averageRating: 'desc' }, { stageName: 'asc' }],
        }),
      count: () => prisma.artistProfile.count({ where }),
    });
  },

  async getById(id: number, isAdmin = false) {
    const artist = await prisma.artistProfile.findFirst({
      where: { id, ...(isAdmin ? {} : { user: { status: 'ACTIVE' } }) },
      include: {
        genres: { include: { genre: true } },
        user: {
          select: { id: true, firstName: true, lastName: true, status: true },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            event: { select: { title: true } },
            organizer: { select: { organizationName: true } },
          },
        },
      },
    });
    if (!artist) throw new AppError(404, 'Izvođač nije pronađen');
    return artist;
  },

  async getMine(user: User) {
    const profile = await requireArtistProfile(user);
    return prisma.artistProfile.findUnique({
      where: { id: profile.id },
      include: { genres: { include: { genre: true } } },
    });
  },

  async updateMine(
    user: User,
    data: {
      stageName?: string;
      biography?: string | null;
      city?: string;
      artistType?: ArtistType;
      memberCount?: number;
      minimumFee?: number;
      maximumFee?: number;
      yearsOfExperience?: number;
      spotifyUrl?: string | null;
      youtubeUrl?: string | null;
      instagramUrl?: string | null;
      isAvailable?: boolean;
      genreIds?: number[];
    },
  ) {
    const profile = await requireArtistProfile(user);
    const { genreIds, ...profileData } = data;

    const minimumFee = profileData.minimumFee ?? Number(profile.minimumFee);
    const maximumFee = profileData.maximumFee ?? Number(profile.maximumFee);
    if (minimumFee > maximumFee) {
      throw new AppError(400, 'Minimalni honorar ne može biti veći od maksimalnog');
    }

    return prisma.$transaction(async (tx) => {
      if (genreIds) {
        await tx.artistGenre.deleteMany({ where: { artistId: profile.id } });
        if (genreIds.length > 0) {
          await tx.artistGenre.createMany({
            data: genreIds.map((genreId) => ({ artistId: profile.id, genreId })),
          });
        }
      }

      return tx.artistProfile.update({
        where: { id: profile.id },
        data: profileData,
        include: { genres: { include: { genre: true } } },
      });
    });
  },

  async listGenres() {
    return prisma.genre.findMany({ orderBy: { name: 'asc' } });
  },
};
