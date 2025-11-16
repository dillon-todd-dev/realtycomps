import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Home, MapPin } from 'lucide-react';
import { PropertyWithImages } from '@/lib/types';

export default function PropertyCard({
  property,
}: {
  property: PropertyWithImages;
}) {
  const parseDecimal = (value: string | null) => {
    if (!value) return null;
    return parseFloat(value);
  };

  const price = parseDecimal(property.currentPrice);
  const bathrooms = parseDecimal(property.bathrooms);

  return (
    <Card className='group hover:shadow-lg transition-shadow duration-200 overflow-hidden'>
      <Link href={`/dashboard/properties/${property.id}`}>
        <div className='relative aspect-[4/3] overflow-hidden'>
          {property.images && property.images.length > 0 ? (
            <Image
              src={property.images[0].url}
              alt={property.images[0].alt || 'Property image'}
              fill
              className='object-cover group-hover:scale-105 transition-transform duration-200'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            />
          ) : (
            <div className='w-full h-full bg-muted flex items-center justify-center'>
              <Home className='h-12 w-12 text-muted-foreground' />
            </div>
          )}

          {/* Price badge */}
          {price && (
            <div className='absolute top-3 right-3'>
              <span className='bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm font-semibold'>
                ${price.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className='p-4'>
        <Link href={`/dashboard/properties/${property.id}`}>
          <div className='space-y-2'>
            {property.address && (
              <div className='flex items-center gap-1 text-muted-foreground'>
                <MapPin className='h-4 w-4' />
                <span className='text-sm line-clamp-1'>{property.address}</span>
              </div>
            )}

            <div className='flex items-center justify-between pt-2'>
              {property.bedrooms && bathrooms ? (
                <div className='text-sm text-muted-foreground'>
                  {property.bedrooms} bed • {bathrooms} bath
                </div>
              ) : null}

              {property.livingArea && (
                <div className='text-sm text-muted-foreground'>
                  {property.livingArea.toLocaleString()} sq ft
                </div>
              )}
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
