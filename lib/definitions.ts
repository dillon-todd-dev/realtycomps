import { z } from 'zod';

export const LoginFormSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }).trim(),
  password: z
    .string()
    .min(8, 'Be at least 8 characters long')
    .regex(/[a-zA-z]/, 'Contain at least one letter')
    .regex(/[0-9]/, 'Contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Contain at least one special character')
    .trim(),
});

export type LoginFormState =
  | {
      errors?: {
        email?: string;
        password?: string;
      };
    }
  | undefined;
