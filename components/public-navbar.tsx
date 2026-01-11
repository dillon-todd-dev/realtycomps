import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function PublicNavbar() {
  return (
    <header className='fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4'>
        {/* Logo */}
        <Link href='/' className='text-xl font-bold'>
          RealtyComps
        </Link>

        {/* Navigation Links - Centered */}
        <nav className='absolute left-1/2 flex -translate-x-1/2 items-center gap-6'>
          <Link
            href='/'
            className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
          >
            Home
          </Link>
          <Link
            href='/contact'
            className='text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
          >
            Contact
          </Link>
        </nav>

        {/* Sign In Button */}
        <Button asChild size='sm'>
          <Link href='/login'>Sign In</Link>
        </Button>
      </div>
    </header>
  );
}
