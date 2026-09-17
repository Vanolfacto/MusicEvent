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
  timeoutMs?: number;
  retryCount?: number;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestWithRetry<T>(options: RequestOptions): Promise<T> {
  const url = `${env.ML_SERVICE_URL}${options.path}`;
  const timeoutMs = options.timeoutMs ?? env.ML_SERVICE_TIMEOUT_MS;
  const retryCount = options.retryCount ?? env.ML_SERVICE_RETRY_COUNT;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

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

      if (attempt < retryCount) {
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

  train() {
    return requestWithRetry<{
      success: boolean;
      message: string;
      modelVersion?: string;
      algorithm?: string;
      metrics?: Record<string, number>;
    }>({
      method: 'POST',
      path: '/train',
      // Retraining runs five scripts sequentially (data prep, preprocessing,
      // training three algorithms, genre-popularity, event-type-fit) — far
      // longer than the ~10s budget used for a single /recommend call. On
      // Render's shared compute this has been observed to take well over 5
      // minutes (downloading + preprocessing 114k rows, then 5-fold CV for
      // three algorithms), so the budget is generous; retrying a slow,
      // already-running job would just duplicate the work.
      timeoutMs: 20 * 60 * 1000,
      retryCount: 0,
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
