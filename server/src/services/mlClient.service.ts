import { z } from 'zod';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import type {
  MlEventPayload,
  MlArtistPayload,
  MlModelInfoResponse,
} from '../utils/mlPayload.js';

const mlRecommendResponseSchema = z.object({
  modelVersion: z.string(),
  recommendations: z.array(
    z.object({
      artistId: z.number().int().positive().nullish(),
      score: z.number().finite(),
      explanation: z.array(z.string()),
    }),
  ),
});

interface RequestOptions {
  method: 'GET' | 'POST';
  path: string;
  body?: unknown;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestWithRetry<T>(options: RequestOptions): Promise<T> {
  const url = `${env.ML_SERVICE_URL}${options.path}`;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= env.ML_SERVICE_RETRY_COUNT; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.ML_SERVICE_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: options.method,
        headers: { 'Content-Type': 'application/json' },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message =
          (errorBody as { detail?: string }).detail ||
          `ML servis vratio status ${response.status}`;
        throw new AppError(response.status >= 500 ? 503 : response.status, message);
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error as Error;

      if (attempt < env.ML_SERVICE_RETRY_COUNT) {
        await sleep(300 * (attempt + 1));
        continue;
      }
    }
  }

  if (lastError instanceof AppError) {
    throw lastError;
  }

  throw new AppError(
    503,
    'ML servis trenutno nije dostupan. Pokušajte ponovo kasnije.',
  );
}

export const mlClientService = {
  health() {
    return requestWithRetry<{ status: string; modelLoaded: boolean; modelVersion: string }>({
      method: 'GET',
      path: '/health',
    });
  },

  modelInfo() {
    return requestWithRetry<MlModelInfoResponse>({
      method: 'GET',
      path: '/model/info',
    });
  },

  async recommend(event: MlEventPayload, artists: MlArtistPayload[]) {
    const raw = await requestWithRetry<unknown>({
      method: 'POST',
      path: '/recommend',
      body: { event, artists },
    });

    const parsed = mlRecommendResponseSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError(502, 'ML servis je vratio neispravan odgovor');
    }
    return parsed.data;
  },
};
