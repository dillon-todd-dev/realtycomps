'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  DollarSign,
  Ruler,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { PropertyWithImages } from '@/lib/types';

interface PropertyDetailViewProps {
  property: PropertyWithImages;
}

export default function PropertyDetailView({
  property,
}: PropertyDetailViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const images = property.images || [];

  // Helper function to parse decimal strings from Drizzle
  const parseDecimal = (value: string | null) => {
    if (!value) return null;
    return parseFloat(value);
  };

  const price = parseDecimal(property.currentPrice);
  const bathrooms = parseDecimal(property.bathrooms);
  const lotSize = parseDecimal(property.lotSize);

  return (
    <div className='space-y-6'>
      {/* Image Gallery */}
      {images.length > 0 && (
        <Card>
          <CardContent className='p-0'>
            <div className='grid grid-cols-1 lg:grid-cols-4 gap-2'>
              {/* Main Image */}
              <div className='lg:col-span-3'>
                <div className='relative aspect-[16/10] overflow-hidden rounded-l-lg'>
                  <Image
                    src={images[selectedImageIndex]?.url || images[0].url}
                    alt={images[selectedImageIndex]?.alt || 'Property image'}
                    fill
                    className='object-cover'
                    sizes='(max-width: 1024px) 100vw, 75vw'
                    priority
                  />
                </div>
              </div>

              {/* Thumbnail Grid */}
              <div className='space-y-2'>
                {images.slice(0, 4).map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer transition-opacity ${
                      index === selectedImageIndex
                        ? 'ring-2 ring-primary'
                        : 'hover:opacity-80'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || `Property image ${index + 1}`}
                      fill
                      className='object-cover'
                      sizes='(max-width: 1024px) 25vw, 200px'
                    />
                    {index === 3 && images.length > 4 && (
                      <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                        <span className='text-white font-semibold'>
                          +{images.length - 4} more
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Details */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div>
                  <CardTitle className='text-2xl'>
                    {property.address && (
                      <div className='flex items-center gap-1 text-muted-foreground mt-2'>
                        <MapPin className='h-4 w-4' />
                        <span>
                          {property.address}
                          {property.city && `, ${property.city}`}
                          {property.state && `, ${property.state}`}
                          {property.postalCode && ` ${property.postalCode}`}
                        </span>
                      </div>
                    )}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Property Features */}
          <Card>
            <CardHeader>
              <CardTitle>Property Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {property.bedrooms && (
                  <div className='flex items-center gap-2'>
                    <Bed className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <div className='font-semibold'>{property.bedrooms}</div>
                      <div className='text-sm text-muted-foreground'>
                        Bedrooms
                      </div>
                    </div>
                  </div>
                )}

                {bathrooms && (
                  <div className='flex items-center gap-2'>
                    <Bath className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <div className='font-semibold'>{bathrooms}</div>
                      <div className='text-sm text-muted-foreground'>
                        Bathrooms
                      </div>
                    </div>
                  </div>
                )}

                {property.livingArea && (
                  <div className='flex items-center gap-2'>
                    <Square className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <div className='font-semibold'>
                        {property.livingArea.toLocaleString()}
                      </div>
                      <div className='text-sm text-muted-foreground'>Sq Ft</div>
                    </div>
                  </div>
                )}

                {property.yearBuilt && (
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <div className='font-semibold'>{property.yearBuilt}</div>
                      <div className='text-sm text-muted-foreground'>
                        Year Built
                      </div>
                    </div>
                  </div>
                )}

                {lotSize && (
                  <div className='flex items-center gap-2'>
                    <Ruler className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <div className='font-semibold'>
                        {lotSize.toLocaleString()}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Lot Size (sq ft)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Price & Status */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {price && (
                <div className='flex items-center gap-2'>
                  <DollarSign className='h-5 w-5 text-muted-foreground' />
                  <div>
                    <div className='text-2xl font-bold'>
                      ${price.toLocaleString()}
                    </div>
                    <div className='text-sm text-muted-foreground'>Price</div>
                  </div>
                </div>
              )}

              {property.status && (
                <div>
                  <div className='text-sm text-muted-foreground mb-1'>
                    Status
                  </div>
                  <Badge
                    variant={
                      property.status === 'active' ? 'default' : 'secondary'
                    }
                    className='capitalize'
                  >
                    {property.status}
                  </Badge>
                </div>
              )}

              <div>
                <div className='text-sm text-muted-foreground mb-1'>
                  Property ID
                </div>
                <div className='font-mono text-sm'>{property.id}</div>
              </div>

              <div>
                <div className='text-sm text-muted-foreground mb-1'>
                  Created
                </div>
                <div className='text-sm'>
                  {new Date(property.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <div className='text-sm text-muted-foreground mb-1'>
                  Last Updated
                </div>
                <div className='text-sm'>
                  {new Date(property.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
