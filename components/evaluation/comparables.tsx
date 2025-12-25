'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Eye } from 'lucide-react';
import { useState, useTransition } from 'react';
import { searchSaleComparables, toggleComparable } from '@/actions/comparables';
import { toast } from 'sonner';
import Image from 'next/image';
import { SelectInput } from '../select-input';
import { ComparableWithImages } from '@/lib/types';

interface ComparablesProps {
  evaluationId: string;
  propertyId: string;
  propertyAddress: string | null;
  initialComparables?: ComparableWithImages[];
  title: string;
  compType: 'SALE' | 'RENT';
}

export default function Comparables({
  evaluationId,
  propertyId,
  initialComparables = [],
  propertyAddress,
  title,
  compType,
}: ComparablesProps) {
  const [comparables, setComparables] =
    useState<ComparableWithImages[]>(initialComparables);
  const [isPending, startTransition] = useTransition();
  const [selectedComparable, setSelectedComparable] =
    useState<ComparableWithImages | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  async function handleSearch(formData: FormData) {
    try {
      const results = await searchSaleComparables({
        evaluationId,
        propertyId,
        address: propertyAddress || '',
        maxRadius: Number(formData.get('maxRadius')),
        minBeds: Number(formData.get('minBeds')) || undefined,
        maxBeds: Number(formData.get('maxBeds')) || undefined,
        minBaths: Number(formData.get('minBaths')) || undefined,
        maxBaths: Number(formData.get('maxBaths')) || undefined,
        minSquareFootage: Number(formData.get('minSquareFootage')) || undefined,
        maxSquareFootage: Number(formData.get('maxSquareFootage')) || undefined,
        daysOld: Number(formData.get('daysOld')) || 365,
        type: compType,
      });

      setComparables(results);
      toast.success(`Found ${results.length} comparable properties`);
    } catch (error) {
      console.error('Failed to search comparables:', error);
      toast.error('Failed to search for comparables');
    }
  }

  async function handleToggleInclude(
    comparableId: string,
    currentState: boolean,
  ) {
    const newState = !currentState;

    // Optimistic update without reordering
    setComparables((prev) =>
      prev.map((comp) =>
        comp.id === comparableId ? { ...comp, included: newState } : comp,
      ),
    );

    try {
      await toggleComparable(comparableId, newState);

      toast.success(newState ? 'Comparable included' : 'Comparable excluded');
    } catch (error) {
      console.error('Failed to update comparable:', error);
      // Revert on error
      setComparables((prev) =>
        prev.map((comp) =>
          comp.id === comparableId ? { ...comp, included: currentState } : comp,
        ),
      );
      toast.error('Failed to update comparable');
    }
  }

  function handleViewDetails(comparable: ComparableWithImages) {
    setSelectedComparable(comparable);
    setDetailModalOpen(true);
  }

  const formatCurrency = (value: string) => {
    return `$${parseFloat(value).toLocaleString()}`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <p className='text-sm text-muted-foreground mt-1'>
            Search for similar properties to analyze market values
          </p>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Search Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(
                async () => await handleSearch(new FormData(e.currentTarget)),
              );
            }}
            className='space-y-4'
          >
            {/* First Row: Radius, Min/Max Beds, Min/Max Baths */}
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='maxRadius'>Max Radius (miles)</Label>
                <SelectInput
                  id='maxRadius'
                  name='maxRadius'
                  type='number'
                  step='0.1'
                  defaultValue='5'
                  placeholder='5'
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='minBeds'>Min Beds</Label>
                <SelectInput
                  id='minBeds'
                  name='minBeds'
                  type='number'
                  placeholder='Any'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='maxBeds'>Max Beds</Label>
                <SelectInput
                  id='maxBeds'
                  name='maxBeds'
                  type='number'
                  placeholder='Any'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='minBaths'>Min Baths</Label>
                <SelectInput
                  id='minBaths'
                  name='minBaths'
                  type='number'
                  step='0.5'
                  placeholder='Any'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='maxBaths'>Max Baths</Label>
                <SelectInput
                  id='maxBaths'
                  name='maxBaths'
                  type='number'
                  step='0.5'
                  placeholder='Any'
                />
              </div>
            </div>

            {/* Second Row: Min/Max Sq Ft, Days Old, Type */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='minSquareFootage'>Min Sq Ft</Label>
                <SelectInput
                  id='minSquareFootage'
                  name='minSquareFootage'
                  type='number'
                  placeholder='Any'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='maxSquareFootage'>Max Sq Ft</Label>
                <SelectInput
                  id='maxSquareFootage'
                  name='maxSquareFootage'
                  type='number'
                  placeholder='Any'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='daysOld'>Max Days Old</Label>
                <SelectInput
                  id='daysOld'
                  name='daysOld'
                  type='number'
                  defaultValue='365'
                  placeholder='365'
                />
              </div>
            </div>

            <Button type='submit' disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Searching...
                </>
              ) : (
                <>
                  <Search className='mr-2 h-4 w-4' />
                  Search Comparables
                </>
              )}
            </Button>
          </form>

          {/* Results Table - Show after any search or if initial data exists */}
          {comparables.length > 0 && (
            <>
              <div className='flex items-center justify-between border-t pt-4'>
                <div>
                  <h3 className='text-sm font-semibold'>
                    {comparables.length} Comparables Found
                  </h3>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {comparables.filter((c) => c.included).length} included in
                    analysis
                  </p>
                </div>
              </div>

              <div className='border rounded-lg overflow-hidden'>
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-12'>Include</TableHead>
                        <TableHead className='w-[180px]'>Address</TableHead>
                        <TableHead className='hidden xl:table-cell'>
                          Subdivision
                        </TableHead>
                        <TableHead className='text-center w-16'>Beds</TableHead>
                        <TableHead className='text-center w-16'>
                          Baths
                        </TableHead>
                        <TableHead className='hidden lg:table-cell text-center w-20'>
                          Garage
                        </TableHead>
                        <TableHead className='hidden lg:table-cell text-center w-20'>
                          Built
                        </TableHead>
                        <TableHead className='text-right w-24'>Sq Ft</TableHead>
                        <TableHead className='text-center w-28'>
                          Listed
                        </TableHead>
                        <TableHead className='text-center w-28'>Sold</TableHead>
                        <TableHead className='hidden md:table-cell text-center w-28'>
                          Close Date
                        </TableHead>
                        <TableHead className='w-12'></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparables.map((comp) => (
                        <TableRow
                          key={comp.id}
                          className={`${
                            !comp.included
                              ? 'opacity-40 bg-muted/50'
                              : 'hover:bg-muted/50'
                          } transition-all`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={comp.included}
                              onCheckedChange={() =>
                                handleToggleInclude(comp.id, comp.included)
                              }
                            />
                          </TableCell>
                          <TableCell
                            className={`font-medium ${
                              !comp.included ? 'line-through' : ''
                            }`}
                          >
                            <div className='whitespace-normal break-words'>
                              {comp.address}
                            </div>
                          </TableCell>
                          <TableCell
                            className={`hidden xl:table-cell ${
                              !comp.included ? 'line-through' : ''
                            }`}
                          >
                            {comp.subdivision || '—'}
                          </TableCell>
                          <TableCell
                            className={`text-center ${
                              !comp.included ? 'line-through' : ''
                            }`}
                          >
                            {comp.bedrooms}
                          </TableCell>
                          <TableCell
                            className={`text-center ${
                              !comp.included ? 'line-through' : ''
                            }`}
                          >
                            {parseFloat(comp.bathrooms)}
                          </TableCell>
                          <TableCell
                            className={`hidden lg:table-cell text-center ${
                              !comp.included ? 'line-through' : ''
                            }`}
                          >
                            {comp.garageSpaces || '—'}
                          </TableCell>
                          <TableCell
                            className={`hidden lg:table-cell text-center ${
                              !comp.included ? 'line-through' : ''
                            }`}
                          >
                            {comp.yearBuilt}
                          </TableCell>
                          <TableCell
                            className={`text-right ${
                              !comp.included ? 'line-through' : ''
                            }`}
                          >
                            {comp.squareFootage.toLocaleString()}
                          </TableCell>
                          <TableCell
                            className={`text-center font-semibold ${
                              !comp.included ? 'line-through' : ''
                            }`}
                          >
                            {formatCurrency(comp.listPrice)}
                          </TableCell>
                          <TableCell
                            className={`text-center font-semibold ${
                              !comp.included ? 'line-through' : ''
                            }`}
                          >
                            {formatCurrency(comp.salePrice)}
                          </TableCell>
                          <TableCell
                            className={`hidden md:table-cell text-center ${
                              !comp.included ? 'line-through' : ''
                            }`}
                          >
                            {new Date(comp.closeDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleViewDetails(comp)}
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail View Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className='max-w-5xl max-h-[95vh] overflow-y-auto'>
          {selectedComparable && (
            <>
              <DialogHeader>
                <DialogTitle className='text-2xl pr-8'>
                  {selectedComparable.address}
                </DialogTitle>
              </DialogHeader>

              <div className='space-y-6 overflow-hidden'>
                {/* Images Carousel */}
                {selectedComparable.images &&
                  selectedComparable.images.length > 0 && (
                    <div className='w-full'>
                      <Carousel className='w-full'>
                        <CarouselContent>
                          {selectedComparable.images.map((image, index) => (
                            <CarouselItem key={index}>
                              <div className='relative aspect-video overflow-hidden rounded-lg bg-muted'>
                                <Image
                                  src={image.url}
                                  alt={
                                    image.description ||
                                    `Property image ${index + 1}`
                                  }
                                  fill
                                  className='object-cover'
                                  sizes='(max-width: 768px) 100vw, 1000px'
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className='left-0' />
                        <CarouselNext className='right-0' />
                      </Carousel>
                    </div>
                  )}

                {/* Property Details Grid */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Bedrooms
                    </div>
                    <div className='text-lg font-semibold'>
                      {selectedComparable.bedrooms}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Bathrooms
                    </div>
                    <div className='text-lg font-semibold'>
                      {parseFloat(selectedComparable.bathrooms)}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Square Feet
                    </div>
                    <div className='text-lg font-semibold'>
                      {selectedComparable.squareFootage.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Year Built
                    </div>
                    <div className='text-lg font-semibold'>
                      {selectedComparable.yearBuilt}
                    </div>
                  </div>
                  {selectedComparable.garageSpaces && (
                    <div>
                      <div className='text-sm text-muted-foreground'>
                        Garage
                      </div>
                      <div className='text-lg font-semibold'>
                        {selectedComparable.garageSpaces} spaces
                      </div>
                    </div>
                  )}
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Days on Market
                    </div>
                    <div className='text-lg font-semibold'>
                      {selectedComparable.daysOnMarket}
                    </div>
                  </div>
                </div>

                {/* Pricing Info */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg'>
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      List Price
                    </div>
                    <div className='text-2xl font-bold'>
                      {formatCurrency(selectedComparable.listPrice)}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Sale Price
                    </div>
                    <div className='text-2xl font-bold text-green-600'>
                      {formatCurrency(selectedComparable.salePrice)}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Close Date
                    </div>
                    <div className='text-2xl font-bold'>
                      {new Date(
                        selectedComparable.closeDate,
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className='flex items-center justify-between'>
                  <Badge
                    variant={
                      selectedComparable.included ? 'default' : 'secondary'
                    }
                  >
                    {selectedComparable.included
                      ? 'Included in Analysis'
                      : 'Excluded'}
                  </Badge>
                  <Button
                    variant='outline'
                    onClick={() => {
                      handleToggleInclude(
                        selectedComparable.id,
                        selectedComparable.included,
                      );
                      // Update the selected comparable for immediate UI feedback
                      setSelectedComparable({
                        ...selectedComparable,
                        included: !selectedComparable.included,
                      });
                    }}
                  >
                    {selectedComparable.included
                      ? 'Exclude from Analysis'
                      : 'Include in Analysis'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
