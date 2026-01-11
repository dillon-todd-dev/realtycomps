import Image from 'next/image';
import { Mail, Phone } from 'lucide-react';
import { ContactForm } from '@/components/contact-form';

export default function ContactPage() {
  return (
    <div className='flex min-h-screen items-center justify-center px-4 py-12'>
      <div className='grid w-full max-w-5xl gap-8 lg:grid-cols-2'>
        {/* Left side - Header and Form */}
        <div>
          {/* Badge */}
          <div className='mb-4'>
            <span className='rounded-md border px-3 py-1 text-sm'>
              Contact Us
            </span>
          </div>

          {/* Heading */}
          <h1 className='mb-4 text-4xl font-bold'>Connect With Us</h1>

          {/* Subtitle */}
          <p className='text-muted-foreground mb-8'>
            Whether you&apos;re looking for more information, have a suggestion,
            or need help with something, we&apos;re here for you.
          </p>

          {/* Form Card */}
          <div className='rounded-lg border p-6'>
            <ContactForm />
          </div>
        </div>

        {/* Right side - Image and Contact Info */}
        <div className='flex h-full flex-col gap-4'>
          {/* Image */}
          <div className='relative min-h-[300px] flex-1 overflow-hidden rounded-lg'>
            <Image
              src='/resource-realty.jpeg'
              alt='Resource Realty'
              fill
              className='object-cover'
              priority
            />
          </div>

          {/* Phone Card */}
          <div className='flex items-center gap-4 rounded-lg border p-4'>
            <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-full'>
              <Phone className='h-5 w-5' />
            </div>
            <div>
              <p className='font-semibold'>Phone</p>
              <a
                href='tel:832-776-5939'
                className='text-muted-foreground hover:underline'
              >
                832-776-5939
              </a>
            </div>
          </div>

          {/* Email Card */}
          <div className='flex items-center gap-4 rounded-lg border p-4'>
            <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-full'>
              <Mail className='h-5 w-5' />
            </div>
            <div>
              <p className='font-semibold'>Email</p>
              <a
                href='mailto:J.dees0103@gmail.com'
                className='text-muted-foreground hover:underline'
              >
                J.dees0103@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
