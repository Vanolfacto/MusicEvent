import type { ArtistType, EventType } from '@prisma/client';

export interface MlEventPayload {
  eventType: EventType;
  city: string;
  expectedAudience: number;
  minimumBudget: number;
  maximumBudget: number;
  preferredArtistType: ArtistType;
  genreIds: number[];
}

export interface MlArtistPayload {
  artistId: number;
  artistType: ArtistType;
  city: string;
  minimumFee: number;
  maximumFee: number;
  averageRating: number;
  totalPerformances: number;
  yearsOfExperience: number;
  isAvailable: boolean;
  genreIds: number[];
  genreNames: string[];
  pastSuccessSimilarEvents: number;
}

export interface MlRecommendationItem {
  artistId: number;
  score: number;
  explanation: string[];
}

export interface MlRecommendResponse {
  modelVersion: string;
  recommendations: MlRecommendationItem[];
}

export interface MlModelInfoResponse {
  modelVersion: string;
  algorithm?: string;
  modelLoaded: boolean;
  datasetSize?: number;
  metrics?: Record<string, number>;
  notes?: string;
}

export function buildMlEventPayload(event: {
  eventType: EventType;
  city: string;
  expectedAudience: number;
  minimumBudget: { toString(): string } | number;
  maximumBudget: { toString(): string } | number;
  preferredArtistType: ArtistType;
  genres: { genreId: number }[];
}): MlEventPayload {
  return {
    eventType: event.eventType,
    city: event.city,
    expectedAudience: event.expectedAudience,
    minimumBudget: Number(event.minimumBudget),
    maximumBudget: Number(event.maximumBudget),
    preferredArtistType: event.preferredArtistType,
    genreIds: event.genres.map((g) => g.genreId),
  };
}

export function buildMlArtistPayload(
  artist: {
    id: number;
    artistType: ArtistType;
    city: string;
    minimumFee: { toString(): string } | number;
    maximumFee: { toString(): string } | number;
    averageRating: { toString(): string } | number;
    totalPerformances: number;
    yearsOfExperience: number;
    isAvailable: boolean;
    genres: { genreId: number; genre: { name: string } }[];
  },
  pastSuccessSimilarEvents = 0.5,
): MlArtistPayload {
  return {
    artistId: artist.id,
    artistType: artist.artistType,
    city: artist.city,
    minimumFee: Number(artist.minimumFee),
    maximumFee: Number(artist.maximumFee),
    averageRating: Number(artist.averageRating),
    totalPerformances: artist.totalPerformances,
    yearsOfExperience: artist.yearsOfExperience,
    isAvailable: artist.isAvailable,
    genreIds: artist.genres.map((g) => g.genreId),
    genreNames: artist.genres.map((g) => g.genre.name),
    pastSuccessSimilarEvents,
  };
}
