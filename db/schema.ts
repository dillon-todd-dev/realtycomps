import { relations } from 'drizzle-orm';
import { pgEnum, integer, decimal } from 'drizzle-orm/pg-core';
import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['ROLE_USER', 'ROLE_ADMIN']);
export const comparableTypeEnum = pgEnum('comparable_type', ['SALE', 'RENT']);

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
  address: text('address'),
  city: text('city'),
  state: text('state'),
  postalCode: text('postal_code'),
  country: text('country').default('United States'),
  originalListPrice: decimal('original_list_price', {
    precision: 12,
    scale: 2,
  }),
  currentPrice: decimal('current_price', { precision: 12, scale: 2 }),
  closePrice: decimal('close_price', { precision: 12, scale: 2 }),
  pricePerSqFt: decimal('price_per_sq_ft', { precision: 12, scale: 2 }),
  bedrooms: integer('bedrooms'),
  bathrooms: decimal('bathrooms', { precision: 3, scale: 1 }), // Allows 2.5 bathrooms
  livingArea: integer('living_area'),
  yearBuilt: integer('year_built'),
  lotSize: decimal('lot_size', { precision: 10, scale: 2 }), // Lot size in square feet
  status: text('status'),
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

export const evaluationsTable = pgTable('evaluations', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id')
    .references(() => propertiesTable.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),

  // Core property evaluation fields
  estimatedSalePrice: decimal('estimated_sale_price', {
    precision: 12,
    scale: 2,
  }).default('0'),
  purchasePrice: decimal('purchase_price', { precision: 12, scale: 2 }).default(
    '0'
  ),
  hardAppraisedPrice: decimal('hard_appraised_price', {
    precision: 12,
    scale: 2,
  }).default('0'),

  // Costs
  sellerContribution: decimal('seller_contribution', {
    precision: 12,
    scale: 2,
  }).default('0'),
  repairs: decimal('repairs', { precision: 12, scale: 2 }).default('0'),
  insurance: decimal('insurance', { precision: 12, scale: 2 }).default('0'),
  survey: decimal('survey', { precision: 12, scale: 2 }).default('400'),
  inspection: decimal('inspection', { precision: 12, scale: 2 }).default('400'),
  appraisal: decimal('appraisal', { precision: 12, scale: 2 }).default('400'),
  miscellaneous: decimal('miscellaneous', { precision: 12, scale: 2 }).default(
    '0'
  ),

  // Income
  rent: decimal('rent', { precision: 12, scale: 2 }).default('0'),
  hoa: decimal('hoa', { precision: 12, scale: 2 }).default('0'),
  propertyTax: decimal('property_tax', { precision: 12, scale: 2 }).default(
    '0'
  ),

  // calculated metrics
  cashOnCashROI: decimal('cash_on_cash_roi', { precision: 5, scale: 2 }),
  totalROI: decimal('total_roi', { precision: 5, scale: 2 }),
  capRate: decimal('cap_rate', { precision: 5, scale: 2 }),
  monthlyCashFlow: decimal('monthly_cash_flow', { precision: 12, scale: 2 }),
  annualCashFlow: decimal('annual_cash_flow', { precision: 12, scale: 2 }),
  totalCashOutOfPocket: decimal('total_cash_out_of_pocket', {
    precision: 12,
    scale: 2,
  }),
  equityCapture: decimal('equity_capture', { precision: 12, scale: 2 }),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Separate table for conventional loan parameters
export const conventionalLoanParamsTable = pgTable('conventional_loan_params', {
  id: uuid('id').primaryKey().defaultRandom(),
  evaluationId: uuid('evaluation_id')
    .references(() => evaluationsTable.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),

  downPayment: decimal('down_payment', { precision: 5, scale: 2 }).default(
    '20'
  ),
  loanTerm: integer('loan_term').default(30),
  interestRate: decimal('interest_rate', { precision: 5, scale: 3 }).default(
    '5.000'
  ),
  lenderFees: decimal('lender_fees', { precision: 12, scale: 2 }).default(
    '6000'
  ),
  mortgageInsurance: decimal('mortgage_insurance', {
    precision: 12,
    scale: 2,
  }).default('0'),
  monthsOfTaxes: integer('months_of_taxes').default(0),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Separate table for hard money loan parameters
export const hardMoneyLoanParamsTable = pgTable('hard_money_loan_params', {
  id: uuid('id').primaryKey().defaultRandom(),
  evaluationId: uuid('evaluation_id')
    .references(() => evaluationsTable.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),

  loanToValue: decimal('loan_to_value', { precision: 5, scale: 2 }).default(
    '70'
  ),
  lenderFees: decimal('lender_fees', { precision: 12, scale: 2 }).default(
    '10000'
  ),
  interestRate: decimal('interest_rate', { precision: 5, scale: 3 }).default(
    '14.000'
  ),
  monthsToRefi: integer('months_to_refi').default(3),
  rollInLenderFees: boolean('roll_in_lender_fees').default(true),
  weeksUntilLeased: integer('weeks_until_leased').default(8),
  maxRefiCashback: decimal('max_refi_cashback', {
    precision: 12,
    scale: 2,
  }).default('2000'),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Separate table for refinance parameters
export const refinanceLoanParamsTable = pgTable('refinance_loan_params', {
  id: uuid('id').primaryKey().defaultRandom(),
  evaluationId: uuid('evaluation_id')
    .references(() => evaluationsTable.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),

  loanToValue: decimal('loan_to_value', { precision: 5, scale: 2 }).default(
    '75'
  ),
  loanTerm: integer('loan_term').default(30),
  interestRate: decimal('interest_rate', { precision: 5, scale: 3 }).default(
    '5.000'
  ),
  lenderFees: decimal('lender_fees', { precision: 12, scale: 2 }).default(
    '5000'
  ),
  monthsOfTaxes: integer('months_of_taxes').default(2),
  mortgageInsurance: decimal('mortgage_insurance', {
    precision: 12,
    scale: 2,
  }).default('0'),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const comparablesTable = pgTable('comparables', {
  id: uuid('id').primaryKey().defaultRandom(),
  evaluationId: uuid('evaluation_id')
    .references(() => evaluationsTable.id, { onDelete: 'cascade' })
    .notNull(),

  address: text('address').notNull(),
  subdivision: text('subdivision').notNull(),
  bedrooms: integer('bedrooms').notNull(),
  bathrooms: decimal('bathrooms', { precision: 3, scale: 1 }).notNull(),
  garageSpaces: integer('garage_spaces').notNull(),
  yearBuilt: integer('year_built').notNull(),
  squareFootage: integer('square_footage').notNull(),
  listPrice: decimal('list_price', { precision: 12, scale: 2 }).notNull(),
  salePrice: decimal({ precision: 12, scale: 2 }).notNull(),
  closeDate: timestamp('close_date').notNull(),
  type: comparableTypeEnum('type').notNull(), // SALE or RENT
  daysOnMarket: integer('days_on_market').notNull(),
  included: boolean('included').default(true).notNull(),

  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const comparableImagesTable = pgTable('comparable_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull(),
  description: text('description'),
  order: integer('order').default(0), // For sorting images
  comparableId: uuid('comparable_id')
    .references(() => comparablesTable.id, { onDelete: 'cascade' })
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
  })
);

export const propertiesRelations = relations(
  propertiesTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [propertiesTable.userId],
      references: [usersTable.id],
    }),
    images: many(propertyImagesTable),
    evaluations: many(evaluationsTable),
  })
);

export const propertyImagesRelations = relations(
  propertyImagesTable,
  ({ one }) => ({
    property: one(propertiesTable, {
      fields: [propertyImagesTable.propertyId],
      references: [propertiesTable.id],
    }),
  })
);

// Update evaluations relations
export const evaluationsRelations = relations(
  evaluationsTable,
  ({ one, many }) => ({
    property: one(propertiesTable, {
      fields: [evaluationsTable.propertyId],
      references: [propertiesTable.id],
    }),
    user: one(usersTable, {
      fields: [evaluationsTable.userId],
      references: [usersTable.id],
    }),
    conventionalLoanParams: one(conventionalLoanParamsTable),
    hardMoneyLoanParams: one(hardMoneyLoanParamsTable),
    refinanceLoanParams: one(refinanceLoanParamsTable),
    comparables: many(comparablesTable),
  })
);

export const refinanceLoanParamsRelations = relations(
  refinanceLoanParamsTable,
  ({ one }) => ({
    evaluation: one(evaluationsTable, {
      fields: [refinanceLoanParamsTable.evaluationId],
      references: [evaluationsTable.id],
    }),
  })
);

export const conventionalLoanParamsRelations = relations(
  conventionalLoanParamsTable,
  ({ one }) => ({
    evaluation: one(evaluationsTable, {
      fields: [conventionalLoanParamsTable.evaluationId],
      references: [evaluationsTable.id],
    }),
  })
);

export const hardMoneyLoanParamsRelations = relations(
  hardMoneyLoanParamsTable,
  ({ one }) => ({
    evaluation: one(evaluationsTable, {
      fields: [hardMoneyLoanParamsTable.evaluationId],
      references: [evaluationsTable.id],
    }),
  })
);

export const comparablesRelations = relations(
  comparablesTable,
  ({ one, many }) => ({
    evaluation: one(evaluationsTable, {
      fields: [comparablesTable.evaluationId],
      references: [evaluationsTable.id],
    }),
    images: many(comparableImagesTable),
  })
);

export const comparableImagesRelations = relations(
  comparableImagesTable,
  ({ one }) => ({
    comparable: one(comparablesTable, {
      fields: [comparableImagesTable.comparableId],
      references: [comparablesTable.id],
    }),
  })
);
