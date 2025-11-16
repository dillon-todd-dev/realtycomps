import { z } from 'zod';
import { createEnv } from '@t3-oss/env-nextjs';

export const ENV = createEnv({
  server: {
    DATABASE_URL: z.url().min(1, 'DATABASE_URL is required'),
    SESSION_SECRET: z
      .string()
      .min(32, 'SESSION_SECRET must be at least 32 characters long'),
    RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
    EMAIL_FROM: z.email().min(1, 'EMAIL_FROM is required'),
    BRIDGE_ACCESS_TOKEN: z.string(),
    BRIDGE_ODATA_BASE_URL: z.url(),
    BRIDGE_BASE_URL: z.url(),
    GOOGLE_API_KEY: z.string(),
  },

  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_GOOGLE_API_KEY: z.string(),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    BRIDGE_ACCESS_TOKEN: process.env.BRIDGE_ACCESS_TOKEN,
    BRIDGE_ODATA_BASE_URL: process.env.BRIDGE_ODATA_BASE_URL,
    BRIDGE_BASE_URL: process.env.BRIDGE_BASE_URL,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_GOOGLE_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  emptyStringAsUndefined: true,
});
