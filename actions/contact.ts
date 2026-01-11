'use server';

import { ContactFormSchema, ContactFormState } from '@/lib/schema';
import { sendContactEmail } from '@/lib/email';

export async function submitContactForm(
  state: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const validatedFields = ContactFormSchema.safeParse({
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    message: formData.get('message') as string,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, phone, message } = validatedFields.data;

  try {
    await sendContactEmail({ name, email, phone, message });

    return {
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
    };
  } catch (error) {
    console.error('Failed to submit contact form:', error);
    return {
      message: 'Failed to send message. Please try again later.',
    };
  }
}
