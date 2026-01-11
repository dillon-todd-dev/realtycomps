'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PublicNavbar() {
  const pathname = usePathname();

  return (
    <header className='fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4'>
        {/* Logo */}
        <Link href='/' className='text-lg font-bold sm:text-xl'>
          RealtyComps
        </Link>

        {/* Navigation Links - Centered on large screens */}
        <nav className='hidden items-center gap-6 md:absolute md:left-1/2 md:flex md:-translate-x-1/2'>
          <Link
            href='/'
            className={cn(
              'text-sm font-medium transition-colors hover:text-foreground',
              pathname === '/' ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            Home
          </Link>
          <Link
            href='/contact'
            className={cn(
              'text-sm font-medium transition-colors hover:text-foreground',
              pathname === '/contact'
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}
          >
            Contact
          </Link>
        </nav>

        {/* Right side - Nav links on mobile + Sign In */}
        <div className='flex items-center gap-4'>
          {/* Mobile nav links */}
          <nav className='flex items-center gap-4 md:hidden'>
            <Link
              href='/'
              className={cn(
                'text-sm font-medium transition-colors hover:text-foreground',
                pathname === '/' ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              Home
            </Link>
            <Link
              href='/contact'
              className={cn(
                'text-sm font-medium transition-colors hover:text-foreground',
                pathname === '/contact'
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              Contact
            </Link>
          </nav>

          <Button asChild size='sm'>
            <Link href='/login'>Sign In</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
