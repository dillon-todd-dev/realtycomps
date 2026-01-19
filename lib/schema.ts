import { z } from 'zod';

export const LoginFormSchema = z.object({
  email: z.email({ message: 'Email is required' }).trim(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormState =
  | {
      success?: boolean;
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export const SetPasswordSchema = z.object({
  password: z.string().min(8, 'Be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Be at least 8 characters long'),
});

export const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email({ message: 'Valid email is required' }).trim(),
  phone: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
});

export type ContactFormState =
  | {
      success?: boolean;
      errors?: {
        name?: string[];
        email?: string[];
        phone?: string[];
        message?: string[];
      };
      message?: string;
    }
  | undefined;

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

export const UpdateEmailSchema = z.object({
  email: z.email({ message: 'Valid email is required' }).trim(),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
