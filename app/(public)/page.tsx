import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center px-4 relative z-10'>
      <Image
        src='/realty-comps-frontpage.jpg'
        alt='RealtyComps Frontpage'
        fill
        className='absolute inset-0 -z-10 h-full w-full object-cover opacity-30'
      />
      <h1 className='mb-6 text-center text-4xl font-bold'>
        Welcome to RealtyComps
      </h1>
      <p className='mb-8 max-w-2xl text-center text-xl'>
        Your ultimate platform for real estate property evaluation and
        management
      </p>
      <div className='space-x-4'>
        <Button asChild>
          <Link href='/login'>Sign In</Link>
        </Button>
        <Button variant='outline' asChild>
          <Link href='/contact'>Contact Us</Link>
        </Button>
      </div>
    </div>
  );
}
