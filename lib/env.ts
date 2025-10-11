import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.url(),
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters long'),
});

const _env = {
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
};

export const ENV: z.infer<typeof envSchema> = envSchema.parse(_env);
