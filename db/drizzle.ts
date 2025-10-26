import { drizzle } from 'drizzle-orm/node-postgres';
import { ENV } from '@/lib/env';
import * as schema from '@/db/schema';

export const db = drizzle({ schema, connection: ENV.DATABASE_URL });
