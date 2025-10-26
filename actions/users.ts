'use server';

import crypto from 'crypto';
import { db } from '@/db/drizzle';
import { userInvitationsTable, usersTable } from '@/db/schema';
import { and, eq, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { sendInvitationEmail } from '@/lib/email';

export async function createUserByAdmin(state: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const role = formData.get('role') as 'ROLE_USER' | 'ROLE_ADMIN';

  if (!email || !firstName || !lastName) {
    throw new Error('Missing required fields');
  }

  try {
    await db.transaction(async (tx) => {
      const existingUser = await tx.query.usersTable.findFirst({
        where: eq(usersTable.email, email),
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const [newUser] = await tx
        .insert(usersTable)
        .values({
          email,
          firstName,
          lastName,
          role: role || 'ROLE_USER',
          password: null,
          hasSetPassword: false,
        })
        .returning();

      const token = crypto.randomBytes(32).toString('hex');
      await tx.insert(userInvitationsTable).values({
        userId: newUser.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await sendInvitationEmail({ email, firstName, lastName, token });
    });

    return { success: true, message: 'User created and invitation sent' };
  } catch (err) {
    console.error('Error creating user', err);
    return {
      error: err instanceof Error ? err.message : 'Error creating user',
    };
  }
}

export async function acceptInvitation(
  token: string,
  state: unknown,
  formData: FormData,
) {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || !confirmPassword) {
    return {
      error: 'Please fill out all fields',
    };
  }

  if (password !== confirmPassword) {
    return {
      error: 'Passwords do not match',
    };
  }

  try {
    await db.transaction(async (tx) => {
      const invitation = await tx.query.userInvitationsTable.findFirst({
        where: and(
          eq(userInvitationsTable.token, token),
          eq(userInvitationsTable.used, false),
          gt(userInvitationsTable.expiresAt, new Date()),
        ),
        with: { user: true },
      });

      if (!invitation || !invitation.userId) {
        throw new Error('Invalid or expired invitation');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await tx
        .update(usersTable)
        .set({
          password: hashedPassword,
          hasSetPassword: true,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, invitation.userId));

      await tx
        .update(userInvitationsTable)
        .set({ used: true, usedAt: new Date() })
        .where(eq(userInvitationsTable.id, invitation.id));
    });
  } catch (err) {
    console.error('Error setting password', err);
    return {
      error: err instanceof Error ? err.message : 'Error setting password',
    };
  }

  redirect('/login');
}
