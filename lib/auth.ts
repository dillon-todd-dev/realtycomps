import { db } from '@/db/drizzle';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
});
