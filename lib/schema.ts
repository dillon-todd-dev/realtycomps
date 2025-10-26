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
