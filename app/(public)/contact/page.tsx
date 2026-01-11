import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ContactPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center px-4'>
      <h1 className='mb-6 text-center text-4xl font-bold'>Contact Us</h1>
      <p className='mb-8 max-w-2xl text-center text-lg'>
        <strong>Name:</strong> Justin Dees
      </p>
      <p className='mb-8 max-w-2xl text-center text-lg'>
        <strong>Email:</strong> J.dees0103@gmail.com
      </p>
      <p className='mb-8 max-w-2xl text-center text-lg'>
        <strong>Phone::</strong> 832-776-5939
      </p>
      <p className='mb-8 max-w-2xl text-center text-lg'>
        <strong>Instagram/Facebook:</strong> realtorjustin.dees
      </p>
      <div className='mt-2'>
        <Button asChild>
          <Link href='/'>Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
