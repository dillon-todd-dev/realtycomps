import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, TrendingUp, Handshake, Users } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    icon: TrendingUp,
    title: 'Investment & Wholesale',
    description:
      'Specializing in distressed properties, investor deals, and wholesale transactions.',
  },
  {
    icon: Building2,
    title: 'Full-Service Real Estate',
    description:
      'We work with buyers, sellers, and investors across all aspects of residential and commercial real estate.',
  },
  {
    icon: Handshake,
    title: 'Strategic Partnership',
    description:
      "Whether you're looking to acquire your next investment property, sell a challenging asset, or need a trusted partner who understands the numbers, we bring strategic insight to every deal.",
  },
  {
    icon: Users,
    title: 'Expert Leadership',
    description:
      'Our broker combines deep market knowledge with an analytical approach honed through years of high-stakes decision-making.',
  },
];

export default async function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className='bg-gray-50 py-24 dark:bg-gray-900 sm:py-32'>
        <div className='mx-auto max-w-6xl px-4'>
          <div className='mx-auto max-w-3xl text-center'>
            <h1 className='mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl'>
              Welcome to{' '}
              <span className='whitespace-nowrap text-primary'>
                Resource Realty
              </span>
            </h1>
            <p className='text-muted-foreground mb-10 text-lg leading-relaxed'>
              Resource Realty services all aspects of real estate. We&apos;re
              actively building our team of agents who want to work smarter,
              close more deals, and grow together.
            </p>
            <div className='flex justify-center gap-4'>
              <Button asChild size='lg'>
                <Link href='/login'>Sign In</Link>
              </Button>
              <Button variant='outline' size='lg' asChild>
                <Link href='/contact'>Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className='bg-white py-16 dark:bg-gray-950 sm:py-24'>
        <div className='mx-auto max-w-6xl px-4'>
          <h2 className='mb-12 text-center text-3xl font-bold'>What We Do</h2>
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {services.map((service) => (
              <Card
                key={service.title}
                className='bg-gray-50 transition-shadow hover:shadow-lg dark:bg-gray-900'
              >
                <CardContent className='p-6'>
                  <service.icon className='text-primary mb-4 h-10 w-10' />
                  <h3 className='mb-2 text-lg font-semibold'>
                    {service.title}
                  </h3>
                  <p className='text-muted-foreground text-sm'>
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
