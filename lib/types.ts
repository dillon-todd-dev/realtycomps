// lib/types.ts - Generated from Drizzle tables

import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import {
  usersTable,
  userInvitationsTable,
  propertiesTable,
  propertyImagesTable,
  evaluationsTable,
  comparablesTable,
  comparableImagesTable,
  documentsTable,
} from '@/db/schema';

// Extract types from tables
export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;
export type UserWithInvitation = User & {
  invitationExpiresAt: Date | null;
};

export type UserInvitation = InferSelectModel<typeof userInvitationsTable>;
export type NewUserInvitation = InferInsertModel<typeof userInvitationsTable>;

export type Property = InferSelectModel<typeof propertiesTable>;
export type NewProperty = InferInsertModel<typeof propertiesTable>;

export type PropertyImage = InferSelectModel<typeof propertyImagesTable>;
export type NewPropertyImage = InferInsertModel<typeof propertyImagesTable>;

export type Evaluation = InferSelectModel<typeof evaluationsTable>;
export type NewEvaluation = InferInsertModel<typeof evaluationsTable>;

export type Comparable = InferSelectModel<typeof comparablesTable>;
export type ComparableImage = InferSelectModel<typeof comparableImagesTable>;
export type ComparableWithImages = Comparable & {
  images: ComparableImage[];
};

export type Document = InferSelectModel<typeof documentsTable>;
export type NewDocument = InferInsertModel<typeof documentsTable>;
export type DocumentCategory = Document['category'];

// You can also create custom types by extending the base types
export type PropertyWithImages = Property & {
  images: PropertyImage[];
};

// For your specific use cases
export type UserRole = User['role']; // 'ROLE_USER' | 'ROLE_ADMIN'
export type PropertyStatus = Property['status']; // 'active' | 'sold' | etc.

// // Partial types for updates
// export type PropertyUpdate = Partial<
//   Pick<Property, 'title' | 'description' | 'address' | 'price' | 'status'>
// > & {
//   updatedAt: Date;
// };

export type UserUpdate = Partial<
  Pick<User, 'firstName' | 'lastName' | 'isActive'>
> & {
  updatedAt: Date;
};

// API response types
export type GetPropertiesResponse = {
  properties: PropertyWithImages[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
};

export type GetUsersResponse = {
  users: UserWithInvitation[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
};

export type Address = {
  streetNumber: string;
  streetName: string;
  streetSuffix: string;
  city: string;
  state: string;
  postalCode: string;
};

export type EvaluationListItem = {
  id: string;
  userId: string;
  strategyType?: 'conventional' | 'hard_money' | null;
  cashOnCashROI?: string | null;
  monthlyCashFlow?: string | null;
  capRate?: string | null;
  totalROI?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EvaluationWithRelations = Evaluation & {
  property: Property;
  comparables: ComparableWithImages[];
};
