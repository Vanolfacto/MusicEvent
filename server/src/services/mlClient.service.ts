import { z } from 'zod';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import type {
  MlEventPayload,
  MlArtistPayload,
  MlModelInfoResponse,
  MlTrainStatusResponse,
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
    // Kicks off the pipeline on the ML service and returns immediately
    // ("training" status) — Render (and most PaaS reverse proxies) kill an
    // HTTP connection long before the real pipeline finishes, so the
    // long-running work happens in a background task on the ML service and
    // the caller polls trainStatus() instead of waiting on this call.
    return requestWithRetry<MlTrainStatusResponse>({
      method: 'POST',
      path: '/train',
      retryCount: 0,
    });
  },

  trainStatus() {
    return requestWithRetry<MlTrainStatusResponse>({
      method: 'GET',
      path: '/train/status',
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
