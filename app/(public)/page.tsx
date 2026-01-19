import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8 lg:h-[calc(100vh-4rem)]'>
      <div className='grid w-full max-w-5xl gap-8 lg:grid-cols-2'>
        {/* Content */}
        <div className='flex flex-col justify-center text-center lg:text-left'>
          <h1 className='mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl'>
            Welcome to ResourceRealty
          </h1>
          <p className='text-muted-foreground mb-8 text-base sm:text-lg'>
            Your ultimate platform for real estate property evaluation and
            management. Analyze properties, find comparables, and make informed
            investment decisions.
          </p>
          <div className='flex justify-center gap-4 lg:justify-start'>
            <Button asChild size='lg'>
              <Link href='/login'>Sign In</Link>
            </Button>
            <Button variant='outline' size='lg' asChild>
              <Link href='/contact'>Contact Us</Link>
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className='flex items-center justify-center'>
          <div className='relative w-full max-w-md overflow-hidden rounded-lg lg:max-w-none'>
            <Image
              src='/realty-comps-frontpage.jpg'
              alt='ResourceRealty'
              width={600}
              height={600}
              className='h-auto w-full'
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
