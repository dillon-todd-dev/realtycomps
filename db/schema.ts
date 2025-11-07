import { relations } from 'drizzle-orm';
import { pgEnum, integer, decimal } from 'drizzle-orm/pg-core';
import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';

export const propertyTypeEnum = pgEnum('property_type', [
  'house',
  'apartment',
  'condo',
  'townhouse',
  'land',
  'commercial',
]);

export const propertyStatusEnum = pgEnum('property_status', [
  'active',
  'sold',
  'pending',
  'inactive',
]);

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

export const propertiesTable = pgTable('properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title'),
  description: text('description'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country').default('United States'),
  price: decimal('price', { precision: 12, scale: 2 }), // Up to $999,999,999.99
  type: propertyTypeEnum('type'),
  bedrooms: integer('bedrooms'),
  bathrooms: decimal('bathrooms', { precision: 3, scale: 1 }), // Allows 2.5 bathrooms
  squareFootage: integer('square_footage'),
  yearBuilt: integer('year_built'),
  lotSize: decimal('lot_size', { precision: 10, scale: 2 }), // Lot size in square feet
  status: propertyStatusEnum('status').default('active'),
  userId: uuid('user_id')
    .references(() => usersTable.id)
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const propertyImagesTable = pgTable('property_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull(),
  alt: text('alt'),
  order: integer('order').default(0), // For sorting images
  propertyId: uuid('property_id')
    .references(() => propertiesTable.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  invitation: one(userInvitationsTable),
  properties: many(propertiesTable),
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

export const propertiesRelations = relations(
  propertiesTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [propertiesTable.userId],
      references: [usersTable.id],
    }),
    images: many(propertyImagesTable),
  }),
);

export const propertyImagesRelations = relations(
  propertyImagesTable,
  ({ one }) => ({
    property: one(propertiesTable, {
      fields: [propertyImagesTable.propertyId],
      references: [propertiesTable.id],
    }),
  }),
);
