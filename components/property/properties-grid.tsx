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
import { Loader2, Search, Home, Plus } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';
import Link from 'next/link';
import PropertyCard from '@/components/property/property-card';

interface PropertiesGridProps {
  initialData: {
    properties: PropertyWithImages[];
    totalCount: number;
    pageCount: number;
    currentPage: number;
  };
  userId: string;
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

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  return (
    <>
      <div className='flex h-14 items-center justify-between border-b bg-background px-6 sticky top-0 z-10'>
        <div className='flex flex-col justify-center'>
          <h1 className='text-lg font-semibold text-foreground'>Properties</h1>
          <p className='text-xs text-muted-foreground'>
            Manage and view your property portfolio
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Input
            placeholder='Search properties...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='min-w-sm'
          />
          <Button asChild>
            <Link href='/dashboard/properties/create'>
              <Plus className='h-4 w-4 mr-2' />
              Add Property
            </Link>
          </Button>
        </div>
      </div>
      <div className='space-y-6 p-6'>
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
                      <span className='font-medium'>{properties.length}</span>{' '}
                      of <span className='font-medium'>{totalCount}</span>{' '}
                      properties
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
    </>
  );
}
