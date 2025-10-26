import { relations } from 'drizzle-orm';
import { pgEnum } from 'drizzle-orm/pg-core';
import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['ROLE_USER', 'ROLE_ADMIN']);

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password'),
  hasSetPassword: boolean('has_set_password').default(false),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: userRoleEnum('role').notNull().default('ROLE_USER'),
  isActive: boolean('is_active').default(false),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const userInvitationsTable = pgTable('user_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => usersTable.id)
    .notNull()
    .unique(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', {
    mode: 'date',
    withTimezone: true,
  }).notNull(),
  used: boolean('used').default(false),
  usedAt: timestamp('used_at', { mode: 'date', withTimezone: true }),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  invitation: one(userInvitationsTable),
}));

export const userInvitationsRelations = relations(
  userInvitationsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userInvitationsTable.userId],
      references: [usersTable.id],
    }),
  }),
);
