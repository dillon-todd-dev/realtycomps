import { pgEnum } from 'drizzle-orm/pg-core';
import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['ROLE_USER', 'ROLE_ADMIN']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: userRoleEnum('role').notNull().default('ROLE_USER'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
});
