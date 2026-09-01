import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .regex(/^\d+[dhms]$/, 'Format mora biti broj praćen jedinicom d/h/m/s (npr. 7d)')
    .default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  ML_SERVICE_URL: z.string().url().default('http://localhost:8000'),
  ML_SERVICE_TIMEOUT_MS: z.coerce.number().default(10000),
  ML_SERVICE_RETRY_COUNT: z.coerce.number().default(2),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration');
  }
  return parsed.data;
}

export const env = loadEnv();
