'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Ruler,
  Calculator,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { EvaluationListItem, PropertyWithImages } from '@/lib/types';
import { Button } from '../ui/button';
import EvaluationListItemCard from '../evaluation/evaluation-list-item';
import { createEvaluation } from '@/actions/evaluations';

interface PropertyDetailViewProps {
  property: PropertyWithImages;
  evaluations?: EvaluationListItem[];
}

export default function PropertyDetailView({
  property,
  evaluations = [],
}: PropertyDetailViewProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [thumbnailApi, setThumbnailApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const images = property.images || [];

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);

      // Sync thumbnail carousel with main carousel
      if (thumbnailApi) {
        thumbnailApi.scrollTo(api.selectedScrollSnap());
      }
    });
  }, [api, thumbnailApi]);

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
      {/* Image Carousel */}
      {images.length > 0 && (
        <Card>
          <CardContent className='p-6'>
            <Carousel setApi={setApi} className='w-full'>
              <CarouselContent>
                {images.map((image) => (
                  <CarouselItem key={image.id}>
                    <div className='relative aspect-[21/9] overflow-hidden rounded-lg'>
                      <Image
                        src={image.url}
                        alt={image.alt || 'Property image'}
                        fill
                        className='object-cover'
                        sizes='100vw'
                        priority
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className='left-4' />
              <CarouselNext className='right-4' />
            </Carousel>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className='mt-4'>
                <Carousel
                  setApi={setThumbnailApi}
                  opts={{
                    align: 'start',
                    dragFree: true,
                  }}
                  className='w-full'
                >
                  <CarouselContent className='-ml-2'>
                    {images.map((image, index) => (
                      <CarouselItem
                        key={`thumb-${image.id}`}
                        className='pl-2 basis-1/4 md:basis-1/6 lg:basis-1/8'
                      >
                        <div
                          className={`relative aspect-[4/3] overflow-hidden rounded-md cursor-pointer transition-all ${
                            current === index + 1
                              ? 'ring-2 ring-primary'
                              : 'hover:opacity-80 opacity-60'
                          }`}
                          onClick={() => api?.scrollTo(index)}
                        >
                          <Image
                            src={image.url}
                            alt={image.alt || `Thumbnail ${index + 1}`}
                            fill
                            className='object-cover'
                            sizes='150px'
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className='text-center text-sm text-muted-foreground mt-3'>
                Image {current} of {count}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Property Information */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between flex-wrap gap-4'>
            <div className='space-y-2'>
              {/* Price */}
              {price && (
                <div className='flex items-center gap-2'>
                  <div className='text-3xl font-bold'>
                    ${price.toLocaleString()}
                  </div>
                  {property.status && (
                    <Badge
                      variant={
                        property.status === 'active' ? 'default' : 'secondary'
                      }
                      className='capitalize'
                    >
                      {property.status}
                    </Badge>
                  )}
                </div>
              )}

              {/* Address */}
              {property.address && (
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <MapPin className='h-4 w-4 flex-shrink-0' />
                  <span>
                    {property.address}
                    {property.city && `, ${property.city}`}
                    {property.state && `, ${property.state}`}
                    {property.postalCode && ` ${property.postalCode}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Key Features */}
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6'>
            {property.bedrooms && (
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-muted rounded-lg'>
                  <Bed className='h-5 w-5 text-muted-foreground' />
                </div>
                <div>
                  <div className='font-semibold text-lg'>
                    {property.bedrooms}
                  </div>
                  <div className='text-sm text-muted-foreground'>Bedrooms</div>
                </div>
              </div>
            )}

            {bathrooms && (
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-muted rounded-lg'>
                  <Bath className='h-5 w-5 text-muted-foreground' />
                </div>
                <div>
                  <div className='font-semibold text-lg'>{bathrooms}</div>
                  <div className='text-sm text-muted-foreground'>Bathrooms</div>
                </div>
              </div>
            )}

            {property.livingArea && (
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-muted rounded-lg'>
                  <Square className='h-5 w-5 text-muted-foreground' />
                </div>
                <div>
                  <div className='font-semibold text-lg'>
                    {property.livingArea.toLocaleString()}
                  </div>
                  <div className='text-sm text-muted-foreground'>Sq Ft</div>
                </div>
              </div>
            )}

            {property.yearBuilt && (
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-muted rounded-lg'>
                  <Calendar className='h-5 w-5 text-muted-foreground' />
                </div>
                <div>
                  <div className='font-semibold text-lg'>
                    {property.yearBuilt}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Year Built
                  </div>
                </div>
              </div>
            )}

            {lotSize && (
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-muted rounded-lg'>
                  <Ruler className='h-5 w-5 text-muted-foreground' />
                </div>
                <div>
                  <div className='font-semibold text-lg'>
                    {lotSize.toLocaleString()}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Lot (sq ft)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Details */}
          <div className='border-t pt-6'>
            <h3 className='text-sm font-semibold text-muted-foreground mb-4'>
              ADDITIONAL DETAILS
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
              <div>
                <div className='text-muted-foreground mb-1'>Property ID</div>
                <div className='font-mono'>{property.id}</div>
              </div>
              <div>
                <div className='text-muted-foreground mb-1'>Created</div>
                <div>{new Date(property.createdAt).toLocaleDateString()}</div>
              </div>
              <div>
                <div className='text-muted-foreground mb-1'>Last Updated</div>
                <div>{new Date(property.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Evaluations */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Investment Evaluations</CardTitle>
            <p className='text-sm text-muted-foreground mt-1'>
              Analyze this property's investment potential
            </p>
          </div>
          <Button
            onClick={() =>
              createEvaluation({
                propertyId: property.id,
                userId: property.userId,
              })
            }
          >
            Create Evaluation
          </Button>
        </CardHeader>
        <CardContent>
          {evaluations?.length === 0 ? (
            <div className='text-center py-12'>
              <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4'>
                <Calculator className='h-8 w-8 text-muted-foreground' />
              </div>
              <h3 className='text-lg font-semibold mb-2'>No evaluations yet</h3>
              <p className='text-sm text-muted-foreground mb-4'>
                Create your first investment evaluation to analyze this
                property's potential ROI, cash flow, and profitability.
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {evaluations.map((evaluation) => (
                <EvaluationListItemCard
                  key={evaluation.id}
                  evaluation={evaluation}
                  propertyId={property.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
