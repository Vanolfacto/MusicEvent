import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildMlArtistPayload, buildMlEventPayload } from '../utils/mlPayload.js';

describe('mlPayload', () => {
  it('builds event payload from db-like object', () => {
    const payload = buildMlEventPayload({
      eventType: 'CONCERT',
      city: 'Beograd',
      expectedAudience: 300,
      minimumBudget: 500,
      maximumBudget: 2000,
      preferredArtistType: 'BAND',
      genres: [{ genreId: 1 }, { genreId: 2 }],
    });

    expect(payload.genreIds).toEqual([1, 2]);
    expect(payload.minimumBudget).toBe(500);
  });

  it('builds artist payload from db-like object', () => {
    const payload = buildMlArtistPayload(
      {
        id: 7,
        artistType: 'SOLO',
        city: 'Novi Sad',
        minimumFee: 400,
        maximumFee: 1200,
        averageRating: 4.2,
        totalPerformances: 10,
        yearsOfExperience: 5,
        isAvailable: true,
        genres: [{ genreId: 3 }],
      },
      0.7,
    );

    expect(payload.artistId).toBe(7);
    expect(payload.pastSuccessSimilarEvents).toBe(0.7);
  });
});

describe('mlClientService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('recommend parses successful ML response', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        modelVersion: '1.0.0',
        recommendations: [
          { artistId: 1, score: 0.91, explanation: ['Žanr se podudara'] },
        ],
      }),
    } as Response);

    const { mlClientService } = await import('../services/mlClient.service.js');
    const result = await mlClientService.recommend(
      buildMlEventPayload({
        eventType: 'CONCERT',
        city: 'Beograd',
        expectedAudience: 300,
        minimumBudget: 500,
        maximumBudget: 2000,
        preferredArtistType: 'BAND',
        genres: [{ genreId: 1 }],
      }),
      [
        buildMlArtistPayload({
          id: 1,
          artistType: 'BAND',
          city: 'Beograd',
          minimumFee: 600,
          maximumFee: 1500,
          averageRating: 4.5,
          totalPerformances: 12,
          yearsOfExperience: 6,
          isAvailable: true,
          genres: [{ genreId: 1 }],
        }),
      ],
    );

    expect(result.recommendations[0].score).toBe(0.91);
  });

  it('recommend throws 503 when ML service unavailable', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('ECONNREFUSED'));

    const { mlClientService } = await import('../services/mlClient.service.js');

    await expect(
      mlClientService.recommend(
        buildMlEventPayload({
          eventType: 'CONCERT',
          city: 'Beograd',
          expectedAudience: 300,
          minimumBudget: 500,
          maximumBudget: 2000,
          preferredArtistType: 'BAND',
          genres: [{ genreId: 1 }],
        }),
        [],
      ),
    ).rejects.toMatchObject({ statusCode: 503 });
  });
});
