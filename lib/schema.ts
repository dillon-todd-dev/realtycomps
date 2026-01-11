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
