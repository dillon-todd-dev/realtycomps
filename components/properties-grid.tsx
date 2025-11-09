'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { getProperties } from '@/actions/properties';
import { PropertyWithImages } from '@/lib/types';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Search, MapPin, Home, Plus } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

interface PropertiesGridProps {
  initialData: {
    properties: PropertyWithImages[];
    totalCount: number;
    pageCount: number;
    currentPage: number;
  };
  userId: string;
}

// Property card component
function PropertyCard({ property }: { property: PropertyWithImages }) {
  // Helper function to parse decimal strings from Drizzle
  const parseDecimal = (value: string | null) => {
    if (!value) return null;
    return parseFloat(value);
  };

  console.log(property.images);
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

export default function PropertiesGrid({
  initialData,
  userId,
}: PropertiesGridProps) {
  const [properties, setProperties] = useState(initialData.properties);
  const [totalCount, setTotalCount] = useState(initialData.totalCount);
  const [pageCount, setPageCount] = useState(initialData.pageCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();

  const debouncedSearch = useDebounce(search, 300);

  const fetchProperties = useCallback(async () => {
    startTransition(async () => {
      try {
        const result = await getProperties({
          page: currentPage,
          pageSize: 12,
          search: debouncedSearch,
          userId,
        });

        setProperties(result.properties);
        setTotalCount(result.totalCount);
        setPageCount(result.pageCount);
      } catch (error) {
        toast.error('Failed to fetch properties');
      }
    });
  }, [currentPage, debouncedSearch, userId]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  return (
    <div className='space-y-6'>
      {/* Filters */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search properties...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-11 h-11'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading overlay */}
      {isPending && (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      )}

      {/* Properties grid */}
      {!isPending && (
        <>
          {properties.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className='py-12'>
                <div className='text-center'>
                  <Home className='mx-auto h-12 w-12 text-muted-foreground' />
                  <h3 className='mt-4 text-lg font-semibold'>
                    No properties found
                  </h3>
                  <p className='text-muted-foreground'>
                    {search
                      ? 'Try adjusting your search or filters'
                      : 'Get started by adding your first property'}
                  </p>
                  {!search && (
                    <Button asChild className='mt-4'>
                      <Link href='/dashboard/properties/create'>
                        <Plus className='h-4 w-4 mr-2' />
                        Add Property
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {pageCount > 1 && (
            <Card>
              <CardContent className='py-4'>
                <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                  <div className='text-sm text-muted-foreground'>
                    Showing{' '}
                    <span className='font-medium'>{properties.length}</span> of{' '}
                    <span className='font-medium'>{totalCount}</span> properties
                  </div>

                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          className={
                            currentPage === 1
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                        (page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className='cursor-pointer'
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ),
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((p) => Math.min(pageCount, p + 1))
                          }
                          className={
                            currentPage === pageCount
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
