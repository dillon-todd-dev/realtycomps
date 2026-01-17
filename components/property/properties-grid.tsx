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
import { Loader2, Home, Plus } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';
import Link from 'next/link';
import PropertyCard from '@/components/property/property-card';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

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
        console.error(error);
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
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-10 bg-background">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-sm font-medium">Properties</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Manage and view your property portfolio
          </p>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Input
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-40 sm:w-64"
          />
          <Button asChild>
            <Link href="/dashboard/properties/create">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Property</span>
            </Link>
          </Button>
        </div>
      </header>
      <div className="space-y-6 p-4 md:p-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 md:py-24">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Home className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">
                  {search ? 'No properties found' : 'No properties yet'}
                </h3>
                <p className="mt-2 text-center text-muted-foreground max-w-sm">
                  {search
                    ? 'Try adjusting your search terms'
                    : 'Add your first property to start tracking your real estate portfolio'}
                </p>
                {!search && (
                  <Button asChild className="mt-6" size="lg">
                    <Link href="/dashboard/properties/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Property
                    </Link>
                  </Button>
                )}
              </div>
            )}

            {/* Pagination */}
            {pageCount > 1 && (
              <Card className="p-0">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      Showing{' '}
                      <span className="font-medium">{properties.length}</span>{' '}
                      of <span className="font-medium">{totalCount}</span>{' '}
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
