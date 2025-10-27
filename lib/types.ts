import { usersTable, userInvitationsTable, userRoleEnum } from '@/db/schema';

export type User = typeof usersTable.$inferSelect;
export type CreateUserData = typeof usersTable.$inferInsert;
export type UserInvitation = typeof userInvitationsTable.$inferSelect;
export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';
