'use server';

import { db } from '@/db/drizzle';
import { usersTable } from '@/db/schema';
import { eq, and, not } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/session';
import {
  UpdateProfileSchema,
  UpdateEmailSchema,
  ChangePasswordSchema,
} from '@/lib/schema';

export async function updateProfile(state: unknown, formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;

  const validated = UpdateProfileSchema.safeParse({ firstName, lastName });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  try {
    const user = await requireUser();

    await db
      .update(usersTable)
      .set({
        firstName: validated.data.firstName,
        lastName: validated.data.lastName,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id));

    revalidatePath('/dashboard/settings');
    return { success: true, message: 'Profile updated successfully' };
  } catch (err) {
    console.error('Error updating profile:', err);
    return { error: 'Failed to update profile' };
  }
}

export async function updateEmail(state: unknown, formData: FormData) {
  const email = formData.get('email') as string;

  const validated = UpdateEmailSchema.safeParse({ email });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  try {
    const user = await requireUser();
    const normalizedEmail = validated.data.email.toLowerCase();

    // Check if email is already taken by another user
    const existingUser = await db.query.usersTable.findFirst({
      where: and(
        eq(usersTable.email, normalizedEmail),
        not(eq(usersTable.id, user.id))
      ),
    });

    if (existingUser) {
      return { error: 'This email is already in use' };
    }

    await db
      .update(usersTable)
      .set({
        email: normalizedEmail,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id));

    revalidatePath('/dashboard/settings');
    return { success: true, message: 'Email updated successfully' };
  } catch (err) {
    console.error('Error updating email:', err);
    return { error: 'Failed to update email' };
  }
}

export async function changePassword(state: unknown, formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const validated = ChangePasswordSchema.safeParse({
    currentPassword,
    newPassword,
    confirmPassword,
  });

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  try {
    const user = await requireUser();

    // Verify current password
    if (!user.password) {
      return { error: 'No password set for this account' };
    }

    const validPassword = await bcrypt.compare(
      validated.data.currentPassword,
      user.password
    );

    if (!validPassword) {
      return { error: 'Current password is incorrect' };
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(validated.data.newPassword, 10);

    await db
      .update(usersTable)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id));

    revalidatePath('/dashboard/settings');
    return { success: true, message: 'Password changed successfully' };
  } catch (err) {
    console.error('Error changing password:', err);
    return { error: 'Failed to change password' };
  }
}
